<template>
    <div class="mt-24">
        <div v-if="!tasksGroup && !displayCopyOption" class="flex">
            <button
                v-if="isIndexSettingsDirty"
                @click="saveSettings()"
                class="block bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
            >
                Save in current index
                <tooltip :position="panelKey === 'leftPanel' ? 'left' : 'right'">Launch a setSettings immediately</tooltip>
            </button>
            <button
                class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                @click="displayCopyOption = true"
            >
                {{ isIndexSettingsDirty ? 'Save in copy' : 'Copy Index' }}
                <tooltip :position="panelKey === 'leftPanel' ? 'left' : 'right'">Display copy options.<br>Will ask for confirmation</tooltip>
            </button>
        </div>
        <div v-if="displayCopyOption && !tasksGroup">
            <h4 class="mb-8">
                {{ isIndexSettingsDirty ? 'Copy and save in' : 'Copy to' }}
            </h4>
            <div class="flex text-solstice-blue">
                <app-selector v-model="dstAppId" class="mr-16" />
                <input v-model="dstIndexName" class="input-custom mr-8 w-124">
            </div>
            <div v-if="indexName.length > 0" class="mt-16">
                <div v-if="sameAppIdAsPanel">
                    <label>
                        <input v-model="inReplicaCopy" type="checkbox" class="mr-2" />
                        In a replica
                    </label>
                </div>
                <div v-if="!inReplicaCopy">
                    <div>
                        <div>
                            <label>
                                <input v-model="limitCopy.enabled" type="checkbox" class="mr-2" />
                                Limit number of hits
                                <span v-if="limitCopy.enabled">
                                    : <input v-model="limitCopy.nbHits" class="input-custom inline w-72" type="number" min="0" step="1000" />
                                </span>
                            </label>
                        </div>
                        <div v-if="!sameAppCopyMethod">
                            <label>
                                <input v-model="configureBatchSize" type="checkbox" class="mr-2" />
                                Configure batch size
                                <span v-if="configureBatchSize">
                                    : <input v-model="batchSize" class="input-custom inline w-72" type="number" min="1" max="1000" step="100" />
                                </span>
                            </label>
                        </div>
                        <div>
                            <label>
                                <input v-model="limitCopy.currentQueryOnly" type="checkbox" class="mr-2" />
                                Limit to current query
                            </label>
                        </div>
                    </div>
                </div>
                <div class="flex mt-16">
                    <button
                        class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                        @click="displayCopyOption = false"
                    >
                        Cancel
                    </button>
                    <button
                        @click="copyIndex"
                        class="block bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group">
                        {{ isIndexSettingsDirty ? 'Copy, save, open in other panel' : 'Copy, open in other panel' }}
                        <tooltip>Launch the copy immediately</tooltip>
                    </button>
                </div>
            </div>
        </div>
        <task-group-view :tasks-group="tasksGroup" />
        <div v-if="errorMessage.length > 0" class="border border-mars-1 mt-16 p-8 rounded">
            <div>{{errorMessage}}</div>
        </div>
    </div>
</template>

<script>
    import AppSelector from "common/components/selectors/AppSelector";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import Tooltip from "common/components/Tooltip";

    import TaskGroupView from "common/components/TasksGroup";
    import {Task, TasksGroup} from "common/utils/tasks";
    import paramsSpecs from 'common/params-specs';
    import {getSearchClient} from 'common/utils/algoliaHelpers';
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'SaveOrCopySettings',
        components: {Tooltip, AppSelector, TaskGroupView},
        props: ['panelKey'],
        mixins: [indexInfoMixin, panelsMixin],
        data: function () {
            return {
                errorMessage: '',
                dstAppId: null,
                dstIndexName: '',
                inReplicaCopy: false,
                configureBatchSize: false,
                limitCopy: {
                    enabled: false,
                    nbHits: 1000,
                    currentQueryOnly: false,
                },
                batchSize: 1000,
                tasksGroup: null,
                displayCopyOption: false,
            }
        },
        created: function () {
            this.dstAppId = this.panelAppId;
            this.dstIndexName = `${this.panelIndexName}_test`;
        },
        computed: {
            appId: function () { // Needed for indexInfoMixin
                return this.panelAppId;
            },
            indexName: function () { // Needed for indexInfoMixin
                return this.panelIndexName;
            },
            sameAppIdAsPanel: function () {
                return this.dstAppId === this.panelAppId;
            },
            sameAppCopyMethod: function () {
                return this.sameAppIdAsPanel && !this.limitCopy.enabled && !this.limitCopy.currentQueryOnly;
            }
        },
        methods: {
            adminAPIKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
            getConfig: async function () {
                const batchSize = this.configureBatchSize ? this.batchSize : 1000;
                const config = {
                    dstAppId: this.dstAppId, // Copy in case it's change during processing
                    dstIndexName: this.dstIndexName, // Copy in case it's change during processing
                    srcAppId: this.panelAppId,
                    srcIndexName: this.panelIndexName,
                    panelKey: this.panelKey,
                    otherPanelKey: this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel',
                    srcClient: await getSearchClient(this.panelAppId, this.adminAPIKey(this.panelAppId), this.panelServer),
                    dstClient: await getSearchClient(this.dstAppId, this.adminAPIKey(this.dstAppId), this.panelServer),
                    query: this.$store.state.panels.query,
                    hitsPerPage: !this.limitCopy.enabled ? batchSize : Math.min(batchSize, this.limitCopy.nbHits),
                    inReplicaCopy: this.inReplicaCopy,
                    applyUnsavedSettings: this.isIndexSettingsDirty,
                };

                config.panelIndex = config.srcClient.initIndex(config.srcIndexName);

                config['searchParams'] = Object.assign(this.searchParams, {hitsPerPage: config.hitsPerPage, query: config.query});
                config['indexSettings'] = Object.assign({}, this.indexSettings);
                config['srcIndex'] = config.srcClient.initIndex(this.panelIndexName);
                config['dstIndex'] = config.dstClient.initIndex(this.dstIndexName);

                return config;
            },
            copyIndex: async function () {
                const config = await this.getConfig();

                if (config.applyUnsavedSettings) {
                    this.$store.commit(`${this.indexCommitPrefix}/resetIndexSettings`);
                }

                if (this.sameAppCopyMethod) {
                    this.tasksGroup = await this.sameAppCopy(config);
                } else {
                    this.tasksGroup = await this.differentAppCopy(config);
                }

                try {
                    this.errorMessage = '';
                    await this.tasksGroup.run();
                } catch (e) {
                    this.errorMessage = e.message;
                    this.tasksGroup = null;
                    throw e;
                }

                this.tasksGroup = null;

                this.$store.commit(`panels/${config.otherPanelKey}/setPanelConfig`, { appId: config.dstAppId, indexName: config.dstIndexName });
                this.$store.commit('panels/setSplitMode', true);
            },
            sameAppCopy: async function (config) {
                const tasksGroup = new TasksGroup(`Copy index ${config.srcAppId}:${config.srcIndexName} to ${config.dstAppId}:${config.dstIndexName}`);
                const srcSettings = await config.srcIndex.getSettings();
                const newSettings = config.applyUnsavedSettings ? config.indexSettings : srcSettings;
                const replicasKey = srcSettings.slaves ? 'slaves' : 'replicas';
                let replicas = srcSettings[replicasKey] || [];

                tasksGroup.addTask(new Task('Setting settings on copy', async () => {
                    delete(newSettings.replicas);

                    const res = await config.dstIndex.setSettings(newSettings);
                    await config.dstIndex.waitTask(res.taskID);
                }));

                tasksGroup.addTask(new Task('Copy rules and synonyms', async () => {
                    const res = await config.srcClient.copyIndex(config.srcIndexName, config.dstIndexName, ['rules', 'synonyms']);
                    await config.dstIndex.waitTask(res.taskID);
                }));

                tasksGroup.addTask(new Task('Copy records', async () => {
                    if (replicas.indexOf(config.dstIndexName) === - 1) {
                        replicas.push(config.dstIndexName);
                    }
                    srcSettings[replicasKey] = replicas;
                    const res = await config.panelIndex.setSettings(srcSettings);
                    await config.panelIndex.waitTask(res.taskID);

                    if (!config.inReplicaCopy) {
                        replicas.splice(replicas.indexOf(config.dstIndexName), 1);
                        srcSettings[replicasKey] = replicas;
                        const res2 = await config.panelIndex.setSettings(srcSettings);
                        await config.panelIndex.waitTask(res2.taskID);
                    }
                    this.$root.$emit('shouldTriggerSearch', config.srcIndexName);
                }));

                return tasksGroup;
            },
            differentAppCopy: async function (config) {
                const tasksGroup = new TasksGroup(`Copy index ${config.srcAppId}:${config.srcIndexName} to ${config.dstAppId}:${config.dstIndexName}`);
                const srcSettings = await config.srcIndex.getSettings();
                const newSettings = config.applyUnsavedSettings ? config.indexSettings : srcSettings;

                tasksGroup.addTask(new Task('Copy settings + unsaved', async () => {
                    delete(newSettings.replicas);

                    const res = await config.dstIndex.setSettings(newSettings);
                    await config.dstIndex.waitTask(res.taskID);
                }));

                tasksGroup.addTask(new Task('Copy synonyms', async () => {
                    await config.srcIndex.exportSynonyms(1000, (synonyms) => {
                        config.dstIndex.batchSynonyms(synonyms, {replaceExistingSynonyms: true});
                    });
                }));

                tasksGroup.addTask(new Task('Copy rules', async () => {
                    await config.srcIndex.exportRules(1000, (rules) => {
                        config.dstIndex.batchRules(rules, {clearExistingRules: true});
                    });
                }));

                if (!this.limitCopy.currentQueryOnly) {
                    const browseTask = new Task('Copy records');

                    browseTask.setCallback(async () => {
                        let nbCopied = 0;
                        let res = await config.srcIndex.customBrowse('', {hitsPerPage: config.hitsPerPage, attributesToRetrieve: ['*']});
                        let nbToCopy = this.limitCopy.enabled ? Math.min(res.nbHits, this.limitCopy.nbHits) : res.nbHits;
                        nbCopied += res.hits.length;
                        browseTask.setNth(0);
                        browseTask.setOutOf(Math.ceil(nbToCopy / config.hitsPerPage));
                        let resAdd = await config.dstIndex.addObjects(res.hits);
                        tasksGroup.addAlgoliaTaskId(resAdd.taskID);
                        browseTask.setNth(res.page + 1);

                        while (res.cursor && (!this.limitCopy.enabled || nbCopied < this.limitCopy.nbHits)) {
                            res = await config.srcIndex.browseFrom(res.cursor);
                            nbCopied += res.hits.length;
                            resAdd = await config.dstIndex.addObjects(res.hits);
                            tasksGroup.addAlgoliaTaskId(resAdd.taskID);
                            browseTask.setNth(res.page + 1);
                        }
                    });
                    tasksGroup.addTask(browseTask);
                } else {
                    tasksGroup.addTask(new Task('Copy records', async () => {
                        const params = Object.assign({}, config.searchParams, {
                            attributesToRetrieve: ['*'],
                            analytics: false,
                            enableABTest: false,
                            page: 0,
                        });
                        let res = await config.srcIndex.customSearch(params);

                        let resAdd = await config.dstIndex.addObjects(res.hits.map((hit) => {
                            delete(hit._highlightResult);
                            delete(hit._snippetResult);
                            return hit;
                        }));
                        tasksGroup.addAlgoliaTaskId(resAdd.taskID);
                    }));
                }

                const waitTask = new Task('Wait Tasks');
                waitTask.setCallback(async () => {
                    if (tasksGroup.tasksIds.length > 0) {
                        waitTask.setNth(0);
                        waitTask.setOutOf(tasksGroup.tasksIds.length);
                        let i;
                        for (i = 0; i < tasksGroup.tasksIds.length; i++) {
                            await config.dstIndex.waitTask(tasksGroup.tasksIds[i]);
                            waitTask.setNth(i + 1);
                        }
                    }
                    this.$root.$emit('shouldTriggerSearch', config.srcIndexName);
                });

                tasksGroup.addTask(waitTask);

                return tasksGroup;
            },
            saveSettings: async function () {
                const config = await this.getConfig();
                const tasksGroup = new TasksGroup(`Update settings of ${config.srcAppId}:${config.srcIndexName}`);

                const defaultSettings = {};

                Object.keys(paramsSpecs).forEach((paramName) => {
                    if (paramsSpecs[paramName].settings_default !== undefined) {
                        if (paramName === 'searchableAttributes' && config.indexSettings.attributesToIndex) return;
                        defaultSettings[paramName] = paramsSpecs[paramName].settings_default;
                    }
                });

                const newSettings = config.indexSettings;
                const settings = Object.assign(defaultSettings, newSettings);

                tasksGroup.addTask(new Task('Set settings', async () => {
                    const res = await config.panelIndex.setSettings(settings);
                    tasksGroup.addAlgoliaTaskId(res.taskID);
                }));

                tasksGroup.addTask(new Task('Wait Tasks', async () => {
                    let i;
                    for (i = 0; i < tasksGroup.tasksIds.length; i++) {
                        await config.panelIndex.waitTask(tasksGroup.tasksIds[i]);
                    }

                    this.$root.$emit('shouldTriggerSearch', config.srcIndexName);
                }));

                this.tasksGroup = tasksGroup;

                try {
                    this.errorMessage = '';
                    await this.tasksGroup.run();
                } catch (e) {
                    this.errorMessage = e.message;
                    this.tasksGroup = null;
                    throw e;
                }
                this.tasksGroup = null;
                this.$store.commit(`apps/${config.srcAppId}/${config.srcIndexName}/replaceIndexSettings`, newSettings);
            }
        }
    }
</script>