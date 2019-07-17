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
        await client.initIndex(indexInfo.primary).waitTask(res1.taskID);

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
        await client.initIndex(indexInfo.primary).waitTask(res.taskID);

        const res1 = await client.copyIndex(indexInfo.name, newIndexName, ['settings', 'synonyms', 'rules']);
        await client.initIndex(newIndexName).waitTask(res1.taskID);

        const newReplicas2 = replicas.filter((replica) => { return replica !== indexInfo.name; });
        const res2 = await primaryIndex.setSettings({ replicas: [...new Set([...newReplicas2, newIndexName])] });
        await client.initIndex(indexInfo.primary).waitTask(res2.taskID);

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