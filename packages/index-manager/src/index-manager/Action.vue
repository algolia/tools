<template>
    <div>
        <div v-if="action.name === 'Rename'">
            Rename index to:
            <input v-model="newIndexName" class="input-custom mt-4 mb-24 p-4" />
            <div class="flex">
                <button v-if="renamable" @click="newIndexName = ''" :class="whiteClasses">Cancel</button>
                <button v-if="renamable" @click="apply" :class="orangeClasses">
                    Rename index "{{indices[0].name}}" to "{{newIndexName}}"
                </button>
            </div>
        </div>
        <div v-if="action.name === 'Replicas'">
            List of replicas:
            <div v-for="(string, i) in newStringList" class="flex items-center">
                <input :ref="`string-list-${i}`" @keyup.enter="addStringToList" v-model="newStringList[i]" class="input-custom mt-4 mb-8 p-4" />
                <trash-icon class="w-12 h-12 ml-8 cursor-pointer -mt-4" @click="newStringList.splice(i, 1)" />
            </div>
            <button :class="whiteClasses" class="text-sm mb-24" @click="addStringToList">Add</button>
            <div class="flex">
                <button v-if="stringListUpdatable" @click="newStringList = JSON.parse(JSON.stringify(stringList))" :class="whiteClasses">Cancel</button>
                <button v-if="stringListUpdatable" @click="apply" :class="orangeClasses">
                    Save replicas of "{{indices[0].name}}"
                </button>
            </div>
        </div>
        <div v-if="action.name === 'Copy'">
            <div><label><input type="checkbox" v-model="copy.records"> Records</label></div>
            <div><label><input type="checkbox" v-model="copy.synonyms"> Synonyms</label></div>
            <div><label><input type="checkbox" v-model="copy.rules"> Rules</label></div>
            <div><label><input type="checkbox" v-model="copy.settings"> Settings</label></div>
            <div class="ml-16">
                <div v-for="(value, key) in settings">
                    <label>
                        <input
                            type="checkbox"
                            :checked="copy.ignoredSettings[key] === undefined || copy.ignoredSettings[key] === false"
                            @input="$set(copy.ignoredSettings, key, !$event.target.checked)"
                        />
                        "{{key}}": {{JSON.stringify(value)}}
                    </label>
                </div>
            </div>
            <div class="mt-24 mb-8 text-sm uppercase tracking-wide">Copy To</div>
            <index-list :list="copy.indexList" />
            <div class="flex mt-24">
                <button v-if="copyable" @click="copy.indexList = [{appId: null, indexName: ''}]" :class="whiteClasses">Cancel</button>
                <button v-if="copyable" @click="apply" :class="orangeClasses">
                    Make {{copy.indexList.length}} copy of "{{indices[0].name}}"
                </button>
            </div>
        </div>
        <div v-if="action.name === 'Apply settings'">
            <params
                id="apply-settings"
                config-key="indexSettings"
                :params="newSettings"
                :ref-params="newSettings"
                :raw-params="newSettings"
                :keys="Object.keys(newSettings)"
                :keys-indexer="null"
                :mutate="true"
            />
            <div class="flex mt-24">
                <button v-if="setSettingsUpdatable" @click="newSettings = {}" :class="whiteClasses">Cancel</button>
                <button v-if="setSettingsUpdatable" @click="apply" :class="orangeClasses">
                    Apply settings for {{indices.length}} {{indices.length > 1 ? 'indices' : 'index'}}
                </button>
            </div>
        </div>
        <div v-if="['Detach', 'Delete', 'Clear', 'Reset settings'].includes(action.name)">
            <div>Type {{action.confirmText}} to confirm you want to {{action.actionName}}:</div>
            <input
                v-model="confirmText"
                class="input-custom my-4 p-4"
            />
            <div class="flex mt-16">
                <button v-if="confirmable" @click="confirmText = ''" :class="whiteClasses">Cancel</button>
                <button v-if="confirmable" @click="apply" :class="redClasses">
                    Confirm {{action.confirmText}} ({{indices.length}} {{indices.length > 1 ? 'indices' : 'index'}})
                </button>
            </div>
        </div>
        <task-group-view class="mt-32" :tasks-group="tasksGroup" />
    </div>
</template>

<script>
    import {Task, TasksGroup} from 'common/utils/tasks';
    import TaskGroupView from 'common/components/TasksGroup';
    import TrashIcon from 'common/icons/trash.svg';
    import Params from 'common/components/params/Params';

    import {
        setSettings,
        setReplicas,
        clearIndex,
        deleteIndex,
        detachReplicaIndex,
        renameIndex,
        resetSettings,
        copyIndex
    } from "@/index-manager/indexOperations";
    import IndexList from "@/index-manager/IndexList";

    export default {
        name: 'Action',
        props: ['indices', 'client', 'action'],
        components: {IndexList, TaskGroupView, TrashIcon, Params},
        data: function () {
            return {
                whiteClasses: 'white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 mr-16',
                orangeClasses: 'block bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group',
                redClasses: 'rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8',
                confirmText: '',
                tasksGroup: null,
                newIndexName: '',
                stringList: [],
                newStringList: [],
                settings: {},
                newSettings: {},
                copy: {
                    records: true,
                    synonyms: true,
                    rules: true,
                    settings: true,
                    ignoredSettings: {},
                    indexList: [{appId: null, indexName: ''}],
                }
            }
        },
        watch: {
            copySetting: function (val) {
                if (!val) {
                    Object.keys(this.settings).forEach((key) => {
                        this.$set(this.copy.ignoredSettings, key, true);
                    });
                } else {
                    this.$set(this.copy, 'ignoredSettings', {});
                }
            }
        },
        created: async function () {
            if (['Replicas', 'Copy'].includes(this.action.name)) {
                const index = this.client.initIndex(this.indices[0].name);
                this.settings = await index.getSettings();

                if (this.action.name === 'Replicas') {
                    this.stringList = this.settings.slaves || this.settings.replicas || [];
                    this.newStringList = JSON.parse(JSON.stringify(this.stringList));
                }
            }
        },
        computed: {
            copyable: function () {
                return (this.copy.records || this.copy.synonyms || this.copy.rules || this.copy.settings) &&
                    this.copy.indexList.filter((index) => index.indexName.length > 0).length > 0;
            },
            copySetting: function () {
                return this.copy.settings;
            },
            renamable: function () {
                return this.newIndexName.length > 0 && this.newIndexName !== this.indices[0].name;
            },
            confirmable: function () {
                return this.confirmText.toLowerCase() === this.action.confirmText.toLowerCase();
            },
            stringListUpdatable: function () {
                return JSON.stringify(this.stringList) !== JSON.stringify(this.newStringList.filter((s) => s.length > 0));
            },
            setSettingsUpdatable: function () {
                return Object.keys(this.newSettings).length > 0;
            }
        },
        methods: {
            addStringToList: function () {
                this.newStringList.push('');
                this.$nextTick(() => {
                    this.$refs[`string-list-${this.newStringList.length - 1}`][0].focus();
                });
            },
            doAction: async function (client, indexInfo, actionName) {
                if (actionName === 'Delete') {
                    await deleteIndex(client, indexInfo);
                } else if (actionName === 'Clear') {
                    await clearIndex(client, indexInfo);
                } else if (actionName === 'Rename') {
                    await renameIndex(client, indexInfo, this.newIndexName);
                } else if (actionName === 'Detach') {
                    await detachReplicaIndex(client, indexInfo);
                } else if (actionName === 'Replicas') {
                    await setReplicas(client, indexInfo, this.newStringList);
                } else if (actionName === 'Reset settings') {
                    await resetSettings(client, indexInfo);
                } else if (actionName === 'Apply settings') {
                    const settings = {};
                    Object.keys(this.newSettings).forEach((key) => {
                        settings[key] = JSON.parse(JSON.stringify(this.newSettings[key].value));
                    });
                    await setSettings(client, indexInfo, settings);
                } else if (actionName === 'Copy') {
                    this.copy.indexList = this.copy.indexList.filter((index) => index.indexName.length > 0);
                    await copyIndex(client, indexInfo, JSON.parse(JSON.stringify(this.copy)));
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
