import paramsSpecs from 'common/params-specs/data.yml';

export function getDefaultSettings() {
    const defaultSettings = {};

    Object.keys(paramsSpecs).forEach((paramName) => {
        if (paramName !== 'replicas' && paramName !== 'slaves' && paramsSpecs[paramName].settings_default !== undefined) {
            defaultSettings[paramName] = paramsSpecs[paramName].settings_default;
        }
    });

    return defaultSettings;
}

export function getNonDefaultSettings(settings) {
    const nonDefaultSettings = {};

    Object.keys(settings).forEach((paramName) => {
        if (paramName === 'replicas' || paramName === 'slaves') return;

        if (paramsSpecs[paramName] && JSON.stringify(paramsSpecs[paramName].settings_default) !== JSON.stringify(settings[paramName])) {
            nonDefaultSettings[paramName] = settings[paramName];
        }
    });

    return nonDefaultSettings;
}

export async function clearIndex(client, indexInfo) {
    const index = client.initIndex(indexInfo.name);

    const res = await index.clearIndex();
    await client.initIndex(indexInfo.name).waitTask(res.taskID);
}

export async function deleteIndex(client, indexInfo) {
    if (indexInfo.primary === undefined) {
        const res = await client.deleteIndex(indexInfo.name);
        await client.initIndex(indexInfo.name).waitTask(res.taskID);
    } else {
        const primaryIndex = client.initIndex(indexInfo.primary);
        const primarySettings = await primaryIndex.getSettings();
        const replicas = primarySettings.replicas || [];
        const newReplicas = replicas.filter((replica) => { return replica !== indexInfo.name; });

        const res1 = await primaryIndex.setSettings({ replicas: newReplicas });
        await primaryIndex.waitTask(res1.taskID);


        const res2 = await client.deleteIndex(indexInfo.name);
        await client.initIndex(indexInfo.name).waitTask(res2.taskID);
    }
}

export async function renameIndex(client, indexInfo, newIndexName) {
    if (indexInfo.primary === undefined) {
        const res = await client.moveIndex(indexInfo.name, newIndexName);
        await client.initIndex(newIndexName).waitTask(res.taskID);
    } else {
        const primaryIndex = client.initIndex(indexInfo.primary);
        const primarySettings = await primaryIndex.getSettings();
        const replicas = primarySettings.replicas || [];
        const newReplicas = [...new Set([...replicas, newIndexName])];

        const res = await primaryIndex.setSettings({ replicas: newReplicas });
        await primaryIndex.waitTask(res.taskID);

        const res1 = await client.copyIndex(indexInfo.name, newIndexName, ['settings', 'synonyms', 'rules']);
        await client.initIndex(newIndexName).waitTask(res1.taskID);

        const newReplicas2 = replicas.filter((replica) => { return replica !== indexInfo.name; });
        const res2 = await primaryIndex.setSettings({ replicas: [...new Set([...newReplicas2, newIndexName])] });
        await primaryIndex.waitTask(res2.taskID);

        const res3 = await client.deleteIndex(indexInfo.name);
        await client.initIndex(indexInfo.name).waitTask(res3.taskID);
    }
}

export async function detachReplicaIndex(client, indexInfo) {
    const primaryIndex = client.initIndex(indexInfo.primary);
    const primarySettings = await primaryIndex.getSettings();
    const replicas = primarySettings.replicas || [];
    const newReplicas = replicas.filter((replica) => { return replica !== indexInfo.name; });

    const res = await primaryIndex.setSettings({ replicas: newReplicas });
    await client.initIndex(indexInfo.primary).waitTask(res.taskID);
}

export async function setReplicas(client, indexInfo, replicas) {
    const primaryIndex = client.initIndex(indexInfo.name);
    const res = await primaryIndex.setSettings({ replicas: replicas });
    await primaryIndex.waitTask(res.taskID);
}

export async function resetSettings(client, indexInfo) {
    await setSettings(client, indexInfo, getDefaultSettings());
}

export async function setSettings(client, indexInfo, settings) {
    const index = client.initIndex(indexInfo.name);
    const res = await index.setSettings(settings);
    await index.waitTask(res.taskID);
}

export async function copyIndex(client, indexInfo, options) {
    const {records, synonyms, rules, settings, ignoredSettings, indexList} = options;

    for (let i = 0; i < indexList.length; i++) {
        const sameAppId = client.applicationID === indexList[i].appId;
        const dstIndex = indexList[i].client.initIndex(indexList[i].indexName);

        if (sameAppId && options.fullSettingsCopy) {
            if (records && synonyms && rules && settings) {
                const res = await client.copyIndex(indexInfo.name, indexList[i].indexName);
                await dstIndex.waitTask(res.taskID);
                return;
            } else if (!records) {
                const scope = [];
                if (synonyms) scope.push('synonyms');
                if (rules) scope.push('rules');
                if (settings) scope.push('settings');
                const res = await client.copyIndex(indexInfo.name, indexList[i].indexName, scope);
                await dstIndex.setSettings({}); // In case the index did not exists before
                await dstIndex.waitTask(res.taskID);
                return;
            }
        }

        // Fallback on different app copy

        const srcIndex = client.initIndex(indexInfo.name);

        if (settings) {
            const newSettings = JSON.parse(JSON.stringify(options.newSettings));

            delete(newSettings.replicas);
            delete(newSettings.slaves);

            const resSettings = await dstIndex.setSettings(newSettings);
            await dstIndex.waitTask(resSettings.taskID);
        }

        if (synonyms) {
            await srcIndex.exportSynonyms(1000, (synonyms) => {
                dstIndex.batchSynonyms(synonyms, {replaceExistingSynonyms: false});
            });
        }

        if (rules) {
            await srcIndex.exportRules(1000, (rules) => {
                dstIndex.batchRules(rules, {clearExistingRules: false});
            });
        }

        if (records) {
            const tasks = [];
            let res = await srcIndex.customBrowse('', {attributesToRetrieve: ['*']});
            let resAdd = await dstIndex.addObjects(res.hits);

            while (res.cursor) {
                res = await srcIndex.browseFrom(res.cursor);
                resAdd = await dstIndex.addObjects(res.hits);
                tasks.push(resAdd.taskID);
            }

            let taskId;
            while (tasks.length > 0) {
                taskId = tasks.shift();
                await dstIndex.waitTask(taskId);
            }
        }
    }
}
