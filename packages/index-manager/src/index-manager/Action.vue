<template>
    <div>
        <div>
            <div>Type {{action.confirmText}} to confirm you want to delete {{indices.length}} {{indices.length > 1 ? 'indices' : 'index'}}:</div>
            <input v-model="confirmText" />
            <div class="flex justify-end mt-16">
                <button
                    v-if="confirmText.toLowerCase() === 'delete'"
                    @click="apply"
                    class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8">
                    Confirm Delete
                </button>
                <button
                    @click="toto()"
                    class="white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 ml-16">
                    Cancel
                </button>
            </div>
        </div>
        <task-group-view :tasks-group="tasksGroup" />
    </div>
</template>

<script>
    import {Task, TasksGroup} from 'common/utils/tasks';
    import TaskGroupView from 'common/components/TasksGroup'

    export default {
        name: 'Action',
        props: ['indices', 'client', 'action'],
        components: {TaskGroupView},
        data: function () {
            return {
                confirmText: '',
                tasksGroup: null,
                userIndexName: 'toto',
            }
        },
        methods: {
            doAction: async function (group, task, client, indexInfo, actionName) {
                if (actionName === 'delete') {
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
                if (actionName === 'clear') {
                    const index = client.initIndex(indexInfo.name);

                    const res = await index.clear();
                    await client.initIndex(indexInfo.name).waitTask(res.taskID);
                }

                if (actionName === 'rename') {
                    if (indexInfo.primary === undefined) {
                        const res = await client.moveIndex(indexInfo.name, this.userIndexName);
                        await client.initIndex(this.userIndexName).waitTask(res.taskID);
                    } else {
                        const primaryIndex = client.initIndex(indexInfo.primary);
                        const primarySettings = await primaryIndex.getSettings();
                        const replicas = primarySettings.replicas || [];
                        const newReplicas = [...new Set([...replicas, this.userIndexName])];

                        const res = await primaryIndex.setSettings({ replicas: newReplicas });
                        await client.initIndex(indexInfo.primary).waitTask(res.taskID);

                        const res1 = await client.copyIndex(indexInfo.name, this.userIndexName, ['settings', 'synonyms', 'rules']);
                        await client.initIndex(this.userIndexName).waitTask(res1.taskID);

                        const newReplicas2 = replicas.filter((replica) => { return replica !== indexInfo.name; });
                        const res2 = await primaryIndex.setSettings({ replicas: [...new Set([...newReplicas2, this.userIndexName])] });
                        await client.initIndex(indexInfo.primary).waitTask(res2.taskID);

                        const res3 = await client.deleteIndex(indexInfo.name);
                        await client.initIndex(indexInfo.name).waitTask(res3.taskID);
                    }
                }

                if (actionName === 'detach') {
                    const primaryIndex = client.initIndex(indexInfo.primary);
                    const primarySettings = await primaryIndex.getSettings();
                    const replicas = primarySettings.replicas || [];
                    const newReplicas = replicas.filter((replica) => { return replica !== indexInfo.name; });

                    const res = await primaryIndex.setSettings({ replicas: newReplicas });
                    await client.initIndex(indexInfo.primary).waitTask(res.taskID);
                }

                if (actionName === 'attach') {
                    const primaryIndex = client.initIndex(indexInfo.name);
                    const primarySettings = await primaryIndex.getSettings();
                    const replicas = primarySettings.replicas || [];
                    const newReplicas = [...new Set([...replicas, this.userIndexName])];

                    const res = await primaryIndex.setSettings({ replicas: newReplicas });
                    await client.initIndex(indexInfo.primary).waitTask(res.taskID);
                }

                if (actionName === 'resetSettings') {
                    //
                }

                if (actionName === 'copy') {
                    const sleep = function (ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    };
                    await sleep(2000);
                }

            },
            apply: async function () {
                const group = new TasksGroup('Apply operations');
                const client = this.client;
                const task = new Task(this.action.description);
                task.setNth(0);
                task.setOutOf(this.indices.length);

                task.setCallback(async () => {
                    let i;
                    for (i = 0; i < this.indices.length; i++) {
                        await this.doAction(group, task, client, this.indices[i], this.action.name);
                        task.setNth(i + 1);
                    }
                });

                group.addTask(task);

                this.tasksGroup = group;
                await this.tasksGroup.run();
                this.tasksGroup = null;

                this.$root.$emit('finishedAction');
            }
        }
    }
</script>