<template>
    <div v-if="dataset && transformer">
        <h2 class="mt-24 text-solstice-blue-opacity-80">Load into index</h2>
        <div class="mt-24">
            <div>
                <label class="cursor-pointer">
                    <input
                        type="checkbox"
                        class="mr-4"
                        v-model="showAllApps"
                    />
                    Unsafe mode (allow copy on non Algolia apps)

                </label>
            </div>
            <div class="mt-12 flex">
                <app-selector v-model="appId" :only-algolia="!showAllApps" />
                <input v-model="indexName" placeholder="Dst indexName" class="ml-24 input-custom mr-8 w-148">
            </div>
        </div>
        <div class="mt-24">
            <task-group-view
                v-if="tasksGroup"
                :tasks-group="tasksGroup"
            />
            <div v-if="!tasksGroup && (!indexInfo || (indexName.length > 0 && (indexName !== indexInfo.indexName || appId !== indexInfo.appId)))">
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
                    <div class="ml-16 mt-4" v-if="method === 'partialUpdateObjects'">
                        <label class="cursor-pointer">
                            createIfNotExists:
                            <select v-model="createIfNotExists">
                                <option :value="true">true</option>
                                <option :value="false">false</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div class="mt-24 flex">
                    <div
                        v-if="appId"
                        @click="process()"
                        class="cursor-pointer bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
                    >
                        Load
                    </div>
                    <div v-else class="rounded border px-16 py-12 border-saturn-4 bg-saturn-4-opacity-40 text-saturn-1">
                        You need to select an appId in order to save
                    </div>
                </div>
                <div v-if="errorMessage.length > 0" class="mt-24 border border-mars-1 mt-16 p-8 rounded">
                    <pre>{{errorMessage}}</pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppSelector from 'common/components/selectors/AppSelector';
    import TaskGroupView from "common/components/TasksGroup";
    import {getClient} from "common/utils/algoliaHelpers";
    import {Task, TasksGroup} from "common/utils/tasks";
    import Papa from "papaparse";
    import oboe from 'oboe';
    import FileStreamer from "./FileStreamer";
    import XmlStreamer from "./XmlStreamer";
    import transformContext from "./transformContext";

    export default {
        name: 'Applier',
        props: ['dataset', 'indexInfo', 'transformer', 'csvFile', 'jsonFile', 'xmlFile', 'xmlRootNode', 'jsonAttributeName'],
        components: {AppSelector, TaskGroupView},
        data: function () {
            return {
                appId: null,
                indexName: 'transformed_index',
                tasksGroup: null,
                errorMessage: '',
                showAllApps: false,
                method: 'saveObjects',
                createIfNotExists: true,
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
                        createIfNotExists: this.createIfNotExists,
                    })
                }
            },
            getNewHits: async function (hits) {
                const newHits = [];

                for (let i = 0; i < hits.length; i++) {
                    try {
                        const newHit = await this.transformer.call(transformContext, hits[i]);

                        if (newHit === null) continue;

                        if (Array.isArray(newHit)) {
                            newHits.push(...newHit);
                        } else {
                            newHits.push(newHit);
                        }
                    } catch (e) {
                        this.errorMessage = e.stack;
                        this.tasksGroup = null;
                        throw e;
                    }
                }

                return newHits;
            },
            process: async function () {
                const clientDst = await getClient(this.appId, this.apiKey(this.appId));
                clientDst.transporter.timeouts = {read: 60, write: 60, connect: 60};
                const dstIndex = await clientDst.customInitIndex(this.indexName);

                const label = this.indexInfo ? `${this.indexInfo.appId}:${this.indexInfo.indexName}` : 'dataset';
                const tasksGroup = new TasksGroup(`Transform ${label} to ${this.appId}:${this.indexName}`);

                if (this.indexInfo) {
                    const client = await getClient(this.indexInfo.appId, this.apiKey(this.indexInfo.appId));
                    client.transporter.timeouts = {read: 60, write: 60, connect: 60};
                    const srcIndex = client.customInitIndex(this.indexInfo.indexName);

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

                } else if (this.jsonFile) {
                    const browseTask = new Task('Upload records');

                    browseTask.setCallback(() => {
                        return new Promise((resolve, reject) => {
                            let count = 0;
                            let hits = [];

                            browseTask.setNth(0);
                            browseTask.setOutOf('unknown');

                            const stream = new FileStreamer(this.jsonFile, async () => {
                                if (hits.length > 0) {
                                    const resAdd = await this.saveObjects(dstIndex, hits);
                                    resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                                    browseTask.setNth(count);
                                }
                                resolve();
                            });

                            const oboeStream = oboe();
                            const attribute = this.jsonAttributeName ? this.jsonAttributeName : '!';
                            
                            oboeStream.node(`${attribute}.[*]`, async (node) => {
                                hits.push(node);
                                count++;
                                if (hits.length >= 1000) {
                                    stream.pause();
                                    const hitsToPush = hits.slice();
                                    hits = [];
                                    const resAdd = await this.saveObjects(dstIndex, hitsToPush);
                                    resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                                    browseTask.setNth(count);
                                    stream.resume();
                                }
                            });

                            stream.start(function (data) {
                                oboeStream.emit('data', data);
                            });
                        })
                    });

                    tasksGroup.addTask(browseTask);
                }
                else if (this.csvFile) {
                    const browseTask = new Task('Upload records');

                    browseTask.setCallback(() => {
                        return new Promise((resolve, reject) => {
                            let hits = [];
                            let count = 0;

                            browseTask.setNth(0);
                            browseTask.setOutOf('unknown');

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
                } else if (this.xmlFile) {
                    const browseTask = new Task('Upload records');

                    browseTask.setCallback(() => {
                        return new Promise((resolve, reject) => {
                            let count = 0;
                            let hits = [];

                            browseTask.setNth(0);
                            browseTask.setOutOf('unknown');

                            const parser = new XmlStreamer(this.xmlRootNode, async (node) => {
                                hits.push(node);
                                count++;
                                if (hits.length >= 1000) {
                                    stream.pause();
                                    const hitsToPush = hits.slice();
                                    hits = [];
                                    const resAdd = await this.saveObjects(dstIndex, hitsToPush);
                                    resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                                    browseTask.setNth(count);
                                    stream.resume();
                                }
                            });

                            const stream = new FileStreamer(this.xmlFile, async () => {
                                if (hits.length > 0) {
                                    const resAdd = await this.saveObjects(dstIndex, hits);
                                    resAdd.taskIDs.forEach((resAddN) => tasksGroup.addAlgoliaTaskId(resAddN));
                                    browseTask.setNth(count);
                                }
                                parser.close();
                                resolve();
                            });

                            stream.start(function (data) {
                                parser.write(data);
                            });
                        })
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
