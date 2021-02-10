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
    await client.customInitIndex(indexInfo.name).clearObjects().wait();
}

export async function deleteIndex(client, indexInfo) {
    if (indexInfo.primary !== undefined) { // If it's a replica first detach
        const primaryIndex = client.customInitIndex(indexInfo.primary);
        const primarySettings = await primaryIndex.getSettings();
        const replicas = primarySettings.replicas || [];
        const newReplicas = replicas.filter((replica) => { return replica !== indexInfo.name; });

        await primaryIndex.setSettings({ replicas: newReplicas }).wait();
    }
    await client.customInitIndex(indexInfo.name).delete().wait();
}

export async function renameIndex(client, indexInfo, newIndexName) {
    if (indexInfo.primary === undefined) {
        await client.moveIndex(indexInfo.name, newIndexName).wait();
    } else {
        const primaryIndex = client.customInitIndex(indexInfo.primary);
        const primarySettings = await primaryIndex.getSettings();
        const replicas = primarySettings.replicas || [];
        const newReplicas = [...new Set([...replicas, newIndexName])];

        await primaryIndex.setSettings({ replicas: newReplicas }).wait();
        await client.copyIndex(indexInfo.name, newIndexName, { scope: ['settings', 'synonyms', 'rules'] }).wait();

        const newReplicas2 = replicas.filter((replica) => { return replica !== indexInfo.name; });
        await primaryIndex.setSettings({ replicas: [...new Set([...newReplicas2, newIndexName])] }).wait();

        await client.customInitIndex(indexInfo.name).delete().wait();
    }
}

export async function detachReplicaIndex(client, indexInfo) {
    const primaryIndex = client.customInitIndex(indexInfo.primary);
    const primarySettings = await primaryIndex.getSettings();
    const replicas = primarySettings.replicas || [];
    const newReplicas = replicas.filter((replica) => { return replica !== indexInfo.name; });

    await primaryIndex.setSettings({ replicas: newReplicas }).wait();
}

export async function setReplicas(client, indexInfo, replicas) {
    await client.customInitIndex(indexInfo.name).setSettings({ replicas: replicas }).wait();
}

export async function resetSettings(client, indexInfo) {
    await setSettings(client, indexInfo, getDefaultSettings());
}

export async function setSettings(client, indexInfo, settings) {
    await client.customInitIndex(indexInfo.name).setSettings(settings).wait();
}

export async function copyIndex(client, indexInfo, options) {
    const {records, synonyms, rules, settings, ignoredSettings, indexList} = options;

    for (let i = 0; i < indexList.length; i++) {
        const sameAppId = client.applicationID === indexList[i].appId;
        const dstIndex = indexList[i].client.customInitIndex(indexList[i].indexName);

        if (sameAppId && options.fullSettingsCopy) {
            if (records && synonyms && rules && settings) {
                await client.copyIndex(indexInfo.name, indexList[i].indexName).wait();
                return;
            } else if (!records) {
                const scope = [];
                if (synonyms) scope.push('synonyms');
                if (rules) scope.push('rules');
                if (settings) scope.push('settings');
                await client.copyIndex(indexInfo.name, indexList[i].indexName, {scope: scope}).wait();
                await dstIndex.setSettings({}).wait(); // In case the index did not exists before
                return;
            }
        }

        // Fallback on different app copy

        const srcIndex = client.customInitIndex(indexInfo.name);

        if (settings) {
            const newSettings = JSON.parse(JSON.stringify(options.newSettings));

            delete(newSettings.replicas);
            delete(newSettings.slaves);

            await dstIndex.setSettings(newSettings).wait();
        }

        if (synonyms) {
            await srcIndex.browseSynonyms({
                hitsPerPage: 1000,
                batch: (synonyms) => {
                    dstIndex.saveSynonyms(synonyms, {replaceExistingSynonyms: false});
                }
            });
        }

        if (rules) {
            await srcIndex.browseRules({
                hitsPerPage: 1000,
                batch: (rules) => {
                    dstIndex.saveRules(rules, {clearExistingRules: false});
                }
            });
        }

        if (records) {
            const tasks = [];
            let res = await srcIndex.customBrowse({query: '', attributesToRetrieve: ['*']});
            let resAdd = await dstIndex.saveObjects(res.hits);

            while (res.cursor) {
                res = await srcIndex.customBrowse({cursor: res.cursor});
                resAdd = await dstIndex.saveObjects(res.hits);
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
