<template>
    <div>
        <h2 class="mt-24 text-solstice-blue-opacity-80">Load into index</h2>
        <div class="mt-24 flex">
            <div class="flex">
                <app-selector v-model="appId" :only-algolia="true" />
                <input v-model="indexName" class="ml-24 input-custom mr-8 w-148">
            </div>
        </div>
        <div class="mt-24">
            <task-group-view
                v-if="tasksGroup"
                :tasks-group="tasksGroup"
            />
            <div v-if="!tasksGroup && (!indexInfo || (indexName.length > 0 && indexName !== indexInfo.indexName))">
                <div>
                    <div>
                        <label class="cursor-pointer">
                            <input type="radio" v-model="method" value="saveObjects" /> saveObjects
                        </label>
                    </div>
                    <div class="mt-4">
                        <label class="cursor-pointer">
                            <input type="radio" v-model="method" value="partialUpdateObjects" /> partialUpdateObjects
                        </label>
                    </div>
                </div>
                <div class="mt-24 flex">
                    <div
                        @click="process()"
                        class="cursor-pointer bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
                    >
                        Load
                    </div>
                </div>
                <div v-if="errorMessage.length > 0" class="mt-24 border border-mars-1 mt-16 p-8 rounded">
                    <div>{{errorMessage}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';
    import TaskGroupView from "common/components/TasksGroup";
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import {Task, TasksGroup} from "common/utils/tasks";
    import algoliasearch from 'algoliasearch';
    import Papa from "papaparse";

    export default {
        name: 'Applier',
        props: ['dataset', 'indexInfo', 'transformer', 'csvFile'],
        components: {AppSelector, IndexSelector, TaskGroupView},
        data: function () {
            return {
                appId: null,
                indexName: this.indexInfo ? `${this.indexInfo.indexName}_transformed` : 'transformed_index',
                tasksGroup: null,
                errorMessage: '',
                method: 'saveObjects',
            }
        },
        methods: {
            chunk: function (hits) {
                const chunks = [];
                let i = 0; let j = 0;
                const chunkSize = 1000;
                for (i = 0, j = hits.length; i < j; i += chunkSize) {
                    chunks.push(hits.slice(i, i + chunkSize));
                }
                return chunks;
            },
            apiKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
            saveObjects: async function (index, hits) {
                const newHits = await this.getNewHits(hits);
                if (this.method === 'saveObjects') {
                    return index.saveObjects(newHits, {
                        autoGenerateObjectIDIfNotExist: true,
                    })
                } else {
                    return index.partialUpdateObjects(newHits, {
                        autoGenerateObjectIDIfNotExist: true,
                    })
                }
            },
            getNewHits: async function (hits) {
                const newHits = [];

                const context = {
                    algoliasearch: algoliasearch,
                };

                for (let i = 0; i < hits.length; i++) {
                    const newHit = await this.transformer.call(context, hits[i]);

                    if (newHit === null) return;

                    if (Array.isArray(newHit)) {
                        newHits.push(...newHit);
                    } else {
                        newHits.push(newHit);
                    }
                }

                return newHits;
            },
            process: async function () {
                const srcIndex = this.indexInfo ? await getSearchIndex(this.indexInfo.appId, this.apiKey(this.indexInfo.appId), this.indexInfo.indexName) : null;
                const dstIndex = await getSearchIndex(this.appId, this.apiKey(this.appId), this.indexName);

                const label = this.indexInfo ? `${this.indexInfo.appId}:${this.indexInfo.indexName}` : 'dataset';
                const tasksGroup = new TasksGroup(`Transform ${label} to ${this.appId}:${this.indexName}`);

                if (this.indexInfo) {
                    const srcSettings = await srcIndex.getSettings();
                    tasksGroup.addTask(new Task('Copy settings/synonyms/rules', async () => {
                        delete(srcSettings.replicas);
                        const promises = [
                            dstIndex.setSettings(srcSettings).wait(),
                            await srcIndex.browseSynonyms({
                                hitsPerPage: 1000,
                                batch: (synonyms) => {
                                    dstIndex.saveSynonyms(synonyms, {replaceExistingSynonyms: false});
                                }
                            }),
                            await srcIndex.browseRules({
                                hitsPerPage: 1000,
                                batch: (rules) => {
                                    dstIndex.saveRules(rules, {clearExistingRules: false});
                                }
                            }),
                        ];

                        await Promise.all(promises);
                    }));

                    const browseTask = new Task('Copy records');

                    browseTask.setCallback(async () => {
                        let res = await srcIndex.customBrowse({
                            query: '',
                            hitsPerPage: 1000,
                            attributesToRetrieve: ['*']
                        });
                        browseTask.setNth(0);
                        browseTask.setOutOf(Math.ceil(res.nbHits / 1000));
                        let resAdd = await this.saveObjects(dstIndex, res.hits);
                        resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                        browseTask.setNth(res.page + 1);

                        while (res.cursor) {
                            res = await srcIndex.customBrowse({cursor: res.cursor});
                            resAdd = await this.saveObjects(dstIndex, res.hits);
                            resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                            browseTask.setNth(res.page + 1);
                        }
                    });
                    tasksGroup.addTask(browseTask);
                } else if (this.csvFile) {
                    const browseTask = new Task('Upload records');

                    browseTask.setCallback(() => {
                        return new Promise((resolve, reject) => {
                            let hits = [];
                            let count = 0;

                            browseTask.setNth(0);
                            browseTask.setOutOf('undefined');

                            Papa.parse(this.csvFile, {
                                header: true,
                                delimitersToGuess: [',', ';', '\t', '#'],
                                step: async (lineObject, parser) => {
                                    hits.push(lineObject.data);
                                    count++;
                                    if (hits.length >= 1000) {
                                        parser.pause();
                                        const resAdd = await this.saveObjects(dstIndex, hits);
                                        resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                                        browseTask.setNth(count);
                                        hits = [];
                                        parser.resume();
                                    }
                                },
                                complete: async (results) => {
                                    if (hits.length > 0) {
                                        const resAdd = await this.saveObjects(dstIndex, hits);
                                        resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                                        browseTask.setNth(count);
                                    }
                                    resolve();
                                }
                            });
                        })
                    });

                    tasksGroup.addTask(browseTask);
                } else {
                    const browseTask = new Task('Upload records');

                    browseTask.setCallback(async () => {
                        const chunks = this.chunk(this.dataset);
                        browseTask.setNth(0);
                        browseTask.setOutOf(chunks.length);

                        for (let i = 0; i < chunks.length; i++) {
                            const resAdd = await this.saveObjects(dstIndex, chunks[i]);
                            resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                            browseTask.setNth(i + 1);
                        }
                    });
                    tasksGroup.addTask(browseTask);
                }

                const waitTask = new Task('Wait Tasks');
                waitTask.setCallback(async () => {
                    if (tasksGroup.tasksIds.length > 0) {
                        waitTask.setNth(0);
                        waitTask.setOutOf(tasksGroup.tasksIds.length);
                        let i;
                        for (i = 0; i < tasksGroup.tasksIds.length; i++) {
                            await dstIndex.waitTask(tasksGroup.tasksIds[i]);
                            waitTask.setNth(i + 1);
                        }
                    }
                });

                tasksGroup.addTask(waitTask);

                this.tasksGroup = tasksGroup;
                this.$root.$emit('onShouldPauseProxy');

                try {
                    this.errorMessage = '';
                    await this.tasksGroup.run();
                } catch (e) {
                    this.errorMessage = e.message;
                    this.tasksGroup = null;
                    throw e;
                }

                this.$root.$emit('onShouldResumeProxy');
                this.tasksGroup = null;
            },
        },
    }
</script>
