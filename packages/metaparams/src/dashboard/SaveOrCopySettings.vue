<template>
    <div class="mt-24">
        <div v-if="!tasksGroup && !displayCopyOption" class="">
            <button
                v-if="!readOnly && isIndexSettingsDirty"
                @click="saveSettings(false)"
                class="block bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
            >
                Save in current index
                <tooltip :position="panelKey === 'leftPanel' ? 'left' : 'right'">Launch a setSettings immediately</tooltip>
            </button>
            <button
                v-if="!readOnly && isIndexSettingsDirty"
                @click="saveSettings(true)"
                class="mt-8 block bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
            >
                Save in current index and all replicas
                <tooltip :position="panelKey === 'leftPanel' ? 'left' : 'right'">Launch a setSettings immediately</tooltip>
            </button>
            <button
                class="mt-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
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
                <app-selector v-model="dstAppId" class="mr-16" :only-algolia="readOnly" />
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
                        <div>
                            <label>
                                <input v-model="overwriteDefaultTimeout" type="checkbox" class="mr-2" />
                                Force write timeout
                                <span v-if="overwriteDefaultTimeout">
                                    : <input v-model="writeTimeout" class="input-custom inline w-72" type="number" min="30" max="1000" step="10" /> secs
                                </span>
                            </label>
                        </div>
                        <div>
                            <label>
                                <input v-model="copyResources.partial" type="checkbox" class="mr-2" />
                                Copy only some resources
                            </label>
                            <div v-if="copyResources.partial" class="ml-12">
                                <div>
                                    <label>
                                        <input v-model="copyResources.records" type="checkbox" class="mr-2" />
                                        Copy records
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input v-model="copyResources.synonyms" type="checkbox" class="mr-2" />
                                        Copy synonyms
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input v-model="copyResources.rules" type="checkbox" class="mr-2" />
                                        Copy rules
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input v-model="copyResources.settings" type="checkbox" class="mr-2" />
                                        Copy settings
                                    </label>
                                </div>
                            </div>
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
    import {getClient} from 'common/utils/algoliaHelpers';
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'SaveOrCopySettings',
        components: {Tooltip, AppSelector, TaskGroupView},
        props: ['panelKey', 'readOnly'],
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
                copyResources: {
                    partial: false,
                    records: true,
                    settings: true,
                    synonyms: true,
                    rules: true,
                },
                batchSize: 1000,
                overwriteDefaultTimeout: false,
                writeTimeout: 30,
                tasksGroup: null,
                displayCopyOption: false,
            }
        },
        created: function () {
            this.dstAppId = !this.readOnly ? this.panelAppId : null;
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
                return this.sameAppIdAsPanel && !this.limitCopy.enabled && !this.limitCopy.currentQueryOnly && !this.copyResources.partial;
            }
        },
        methods: {
            adminAPIKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
            userId: function (appId) {
                return this.$store.state.apps[appId].userId;
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
                    srcClient: await getClient(this.panelAppId, this.adminAPIKey(this.panelAppId), this.panelServer, this.userId(this.panelAppId)),
                    dstClient: this.dstAppId ? await getClient(this.dstAppId, this.adminAPIKey(this.dstAppId), this.panelServer, this.userId(this.dstAppId)) : null,
                    query: this.$store.state.panels.query,
                    hitsPerPage: !this.limitCopy.enabled ? batchSize : Math.min(batchSize, this.limitCopy.nbHits),
                    inReplicaCopy: this.inReplicaCopy,
                    applyUnsavedSettings: this.isIndexSettingsDirty,
                    copyResources: {...this.copyResources},
                };

                config.panelIndex = config.srcClient.customInitIndex(config.srcIndexName);

                config['searchParams'] = Object.assign(this.searchParams, {hitsPerPage: config.hitsPerPage, query: config.query});
                config['indexSettings'] = Object.assign({}, this.indexSettings);
                config['srcIndex'] = config.srcClient.customInitIndex(this.panelIndexName);
                if (config.dstClient) {
                    config['dstIndex'] = config.dstClient.customInitIndex(this.dstIndexName);
                    config.timeoutBackup = config.dstClient.transporter.timeouts;
                    config.dstClient.transporter.timeouts.read = Math.ceil(this.writeTimeout / 15 * 1000);
                    config.dstClient.transporter.timeouts.write = Math.ceil(this.writeTimeout * 1000);
                }

                return config;
            },
            copyIndex: async function () {
                const config = await this.getConfig();

                if (config.applyUnsavedSettings) {
                    this.$store.commit(`${this.indexCommitPrefix}/resetIndexSettings`);
                }

                if (this.sameAppCopyMethod && !this.userId(config.srcAppId) && !this.userId(config.dstAppId)) {
                    this.tasksGroup = await this.sameAppCopy(config);
                } else {
                    this.tasksGroup = await this.differentAppCopy(config);
                }

                this.$root.$emit('onShouldPauseProxy');
                try {
                    this.errorMessage = '';
                    await this.tasksGroup.run();
                    config.dstClient.transporter.timeouts = config.timeoutBackup;
                } catch (e) {
                    this.errorMessage = e.message;
                    this.tasksGroup = null;
                    throw e;
                }
                this.$root.$emit('onShouldResumeProxy');

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
                    await config.dstIndex.setSettings(newSettings).wait();
                }));

                tasksGroup.addTask(new Task('Copy rules and synonyms', async () => {
                    await config.srcClient.copyIndex(config.srcIndexName, config.dstIndexName, {scope: ['rules', 'synonyms']}).wait();
                }));

                tasksGroup.addTask(new Task('Copy records', async () => {
                    if (replicas.indexOf(config.dstIndexName) === - 1) {
                        replicas.push(config.dstIndexName);
                    }
                    srcSettings[replicasKey] = replicas;
                    await config.panelIndex.setSettings(srcSettings).wait();

                    if (!config.inReplicaCopy) {
                        replicas.splice(replicas.indexOf(config.dstIndexName), 1);
                        srcSettings[replicasKey] = replicas;
                        await config.panelIndex.setSettings(srcSettings).wait();
                    }
                    this.$root.$emit('shouldTriggerSearch', config.srcIndexName);
                }));

                return tasksGroup;
            },
            differentAppCopy: async function (config) {
                const tasksGroup = new TasksGroup(`Copy index ${config.srcAppId}:${config.srcIndexName} to ${config.dstAppId}:${config.dstIndexName}`);
                const srcSettings = await config.srcIndex.getSettings();
                const newSettings = config.applyUnsavedSettings ? config.indexSettings : srcSettings;

                if (!config.copyResources.partial || config.copyResources.settings) {
                    tasksGroup.addTask(new Task('Copy settings + unsaved', async () => {
                        delete(newSettings.replicas);
                        await config.dstIndex.setSettings(newSettings).wait();
                    }));
                }

                if (!config.copyResources.partial || config.copyResources.synonyms) {
                    tasksGroup.addTask(new Task('Copy synonyms', async () => {
                        await config.srcIndex.browseSynonyms({
                            hitsPerPage: 1000,
                            batch: (synonyms) => {
                                config.dstIndex.saveSynonyms(synonyms, {replaceExistingSynonyms: false});
                            }
                        });
                    }));
                }

                if (!config.copyResources.partial || config.copyResources.rules) {
                    tasksGroup.addTask(new Task('Copy rules', async () => {
                        await config.srcIndex.browseRules({
                            hitsPerPage: 1000,
                            batch: (rules) => {
                                config.dstIndex.saveRules(rules, {clearExistingRules: false});
                            }
                        });
                    }));
                }

                if (!config.copyResources.partial || config.copyResources.records) {
                    if (!this.limitCopy.currentQueryOnly) {
                        const browseTask = new Task('Copy records');

                        browseTask.setCallback(async () => {
                            let nbCopied = 0;
                            let res = await config.srcIndex.customBrowse({
                                query: '',
                                hitsPerPage: config.hitsPerPage,
                                attributesToRetrieve: ['*']
                            });
                            let nbToCopy = this.limitCopy.enabled ? Math.min(res.nbHits, this.limitCopy.nbHits) : res.nbHits;
                            nbCopied += res.hits.length;
                            browseTask.setNth(0);
                            browseTask.setOutOf(Math.ceil(nbToCopy / config.hitsPerPage));
                            let resAdd = await config.dstIndex.saveObjects(res.hits);
                            resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                            browseTask.setNth(res.page + 1);

                            while (res.cursor && (!this.limitCopy.enabled || nbCopied < this.limitCopy.nbHits)) {
                                res = await config.srcIndex.customBrowse({cursor: res.cursor});
                                nbCopied += res.hits.length;
                                resAdd = await config.dstIndex.saveObjects(res.hits);
                                resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
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

                            let resAdd = await config.dstIndex.saveObjects(res.hits.map((hit) => {
                                delete (hit._highlightResult);
                                delete (hit._snippetResult);
                                return hit;
                            }));
                            resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                        }));
                    }
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
            saveSettings: async function (forwardToReplicas) {
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
                    const res = await config.panelIndex.setSettings(settings, {forwardToReplicas: !!forwardToReplicas});
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
