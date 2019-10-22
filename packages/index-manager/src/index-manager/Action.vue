<template>
    <div>
        <div>
            <div>Type {{action.confirmText}} to confirm you want to delete {{indices.length}} {{indices.length > 1 ? 'indices' : 'index'}}:</div>
            <input v-model="confirmText" />
            <div class="flex justify-end mt-16">
                <button
                    v-if="confirmText.toLowerCase() === action.confirmText.toLowerCase()"
                    @click="apply"
                    class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8">
                    Confirm {{action.confirmText}}
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
    import TaskGroupView from 'common/components/TasksGroup';

    import {
        attachReplicaIndex,
        clearIndex,
        deleteIndex,
        detachReplicaIndex,
        renameIndex,
        resetSettings,
    } from "@/index-manager/indexOperations";

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
            doAction: async function (client, indexInfo, actionName) {
                if (actionName === 'delete') {
                    await deleteIndex(client, indexInfo);
                } else if (actionName === 'clear') {
                    await clearIndex(client, indexInfo);
                } else if (actionName === 'rename') {
                    await renameIndex(client, indexInfo, this.userIndexName);
                } else if (actionName === 'detach') {
                    await detachReplicaIndex(client, indexInfo);
                } else if (actionName === 'attach') {
                    await attachReplicaIndex(client, indexInfo, this.userIndexName);
                } else if (actionName === 'resetSettings') {
                    await resetSettings(client, indexInfo);
                } else if (actionName === 'copy') {
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
                        await this.doAction(client, this.indices[i], this.action.name);
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
