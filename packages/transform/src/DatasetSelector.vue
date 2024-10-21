<template>
    <div>
        <h2 class="text-solstice-blue-opacity-80">Extract</h2>
        <div class="flex mt-24">
            <div
                @click="setType('index')"
                class="w-232 cursor-pointer mr-24 text-center rounded border border-proton-grey-opacity-60 p-24"
                :class="type === 'index' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                Algolia Index (∞ size)
            </div>
            <div
                @click="setType('csv')"
                class="w-232 cursor-pointer mr-24 text-center rounded border border-proton-grey-opacity-60 p-24"
                :class="type === 'csv' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                CSV (∞ size)
            </div>
            <div
                @click="setType('json')"
                class="w-232 cursor-pointer mr-24 text-center rounded border border-proton-grey-opacity-60 p-24"
                :class="type === 'json' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                JSON (∞ size)
            </div>
            <div
                @click="setType('xml')"
                class="w-232 cursor-pointer mr-24 text-center rounded border border-proton-grey-opacity-60 p-24"
                :class="type === 'xml' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                XML (∞ size)
            </div>
        </div>
        <div v-if="['json', 'csv', 'xml'].includes(type)">
            <div class="mt-24">
                <div>
                    <input ref="file" class="invisible" type="file" @change="setFiles($event.target.files)">
                    <div
                        class="border cursor-pointer rounded p-48 mt-8"
                        :class="isDragring ? 'border-mars-1' : 'border-proton-grey-opacity-60'"
                        v-cloak
                        @click="file = null; $refs.file.click()"
                        @dragenter="isDragring = true"
                        @dragleave="isDragring = false"
                        @drop="isDragring = false"
                        @drop.prevent="setFiles($event.dataTransfer.files)"
                        @dragover.prevent
                    >
                        <div>Click to choose file</div>
                        <div class="my-12">OR</div>
                        <div>{{ isDragring ? 'Drop file here' : 'Drag file here' }}</div>
                    </div>
                    <div v-if="file" class="mt-4">
                        Loaded: {{file.name}}
                    </div>
                    <div v-if="type === 'xml'" class="flex mt-24">
                        Xml node name:
                        <input
                            ref=""
                            type="text"
                            v-model="xmlRootNode"
                            class="input-custom ml-8 w-124"
                            @keyup.enter="updateXmlRootNode()"
                        />
                    </div>
                    <div v-if="xmlError" class="flex mt-16">
                        <!-- XSS Check: all xmlError values are being constructed using `escapeHtml` -->
                        <div
                            class="border border-mars-1-opacity-60 bg-mars-1-opacity-20 p-8 rounded"
                            v-html="xmlError"
                        >
                        </div>
                    </div>
                    <div class="mt-24" v-if="isLoadingFile">Loading ...</div>
                </div>
            </div>
        </div>
        <div v-if="type === 'index'">
            <div class="mt-24 flex">
                <div class="flex items-center">
                    <app-selector v-model="indexInfo.appId" />
                    <index-selector
                        v-model="indexInfo.indexName"
                        :app-id="indexInfo.appId"
                        class="ml-24"
                        allow-free-text="true"
                    />
                    <div class="flex ml-48">
                        Fetch extra record:
                        <input
                            type="text"
                            v-model="extraObjectID"
                            class="input-custom ml-8 w-124"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="dataset && dataset.length > 0" class="mt-24">
            {{dataset.length}} records loaded
            <span v-if="sample">
                (This is a sample, csv will be fully loaded during the apply step)
            </span>
        </div>
    </div>
</template>

<script>
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import {escapeHtml} from 'common/utils/formatters';
    import Papa from 'papaparse';
    import FileStreamer from "./FileStreamer";
    import oboe from 'oboe';
    import XmlStreamer from "./XmlStreamer";

    export default {
        name: 'DatasetSelector',
        components: {AppSelector, IndexSelector},
        data: function () {
            return {
                type: null,
                url: '',
                file: null,
                rawDataSetString: '',
                dataset: null,
                csvFile: null,
                jsonFile: null,
                xmlFile: null,
                extraObjectID: '',
                isLoadingFile: false,
                isDragring: false,
                sample: false,
                xmlError: '',
                xmlRootNode: 'item',
                indexInfo: {
                    appId: null,
                    indexName: null,
                },
                nbHits: null,
            }
        },
        watch: {
            dataset: function () {
                this.$emit('onUpdateDataset', this.dataset);
            },
            csvFile: function () {
                this.$emit('onUpdateCsvFile', this.csvFile);
            },
            jsonFile: function () {
                this.$emit('onUpdateJsonFile', this.jsonFile);
            },
            xmlFile: function () {
                this.$emit('onUpdateXmlFile', this.xmlFile);
            },
            indexInfo: {
                deep: true,
                handler: function () {
                    this.loadIndex();
                }
            },
            extraObjectID: function () {
                this.loadIndex(true);
            },
        },
        computed: {
            apiKey: function () {
                return this.indexInfo.appId && this.$store.state.apps[this.indexInfo.appId] ? this.$store.state.apps[this.indexInfo.appId].key : '';
            },
        },
        methods: {
            updateXmlRootNode: function () {
                this.$emit('onUpdateXmlRootNode', this.xmlRootNode);
                this.reset();
                this.loadFile();
            },
            setType: function (type) {
                this.reset();
                this.type = type;
                if (type === 'index') {
                    this.loadIndex();
                }
            },
            reset: function () {
                this.nbHits = null;
                this.dataset = null;
                this.csvFile = null;
                this.jsonFile = null;
                this.isLoadingFile = false;
                this.sample = false;
                this.xmlError = '';
                this.$emit('onUpdateIndexInfo', null);
            },
            setFiles: function (droppedFiles) {
                if(!droppedFiles) return;
                const files = [...droppedFiles];
                this.file = files[0];
                this.reset();
                this.loadFile();
            },
            loadFile: function () {
                if(!this.file) return;

                if (this.type === 'json') {
                    this.isLoadingFile = true;

                    let count = 0;
                    let hits = [];

                    const stream = new FileStreamer(this.file, () => {
                        this.jsonFile = this.file;
                        this.dataset = Object.freeze(hits);
                        this.isLoadingFile = false;
                    });

                    const oboeStream = oboe();
                    oboeStream.node('!.[*]', (node) => {
                        if (!this.isLoadingFile) return;

                        hits.push(node);
                        count++;

                        if (count >= 100) {
                            this.jsonFile = this.file;
                            this.dataset = Object.freeze(hits);
                            this.isLoadingFile = false;
                            this.sample = true;
                            stream.pause();
                        }
                    });

                    stream.start(function (data) {
                        oboeStream.emit('data', data);
                    });
                } else if (this.type === 'csv') {
                    this.isLoadingFile = true;

                    const hits = [];
                    let count = 0;
                    Papa.parse(this.file, {
                        header: true,
                        delimitersToGuess: [',', ';', '\t', '#', '|'],
                        preview: 100,
                        step: async (lineObject, parser) => {
                            hits.push(lineObject.data);
                            count++;
                            if (count >= 100) {
                                this.csvFile = this.file;
                                this.dataset = Object.freeze(hits);
                                this.isLoadingFile = false;
                                this.sample = true;
                            }
                        },
                        error: function () { count++; },
                        complete: (results) => {
                            this.csvFile = this.file;
                            this.dataset = Object.freeze(hits);
                            this.isLoadingFile = false;
                        }
                    });
                } else if (this.type === 'xml') {
                    this.isLoadingFile = true;

                    let count = 0;
                    let hits = [];

                    const parser = new XmlStreamer(this.xmlRootNode, (node) => {
                        if (!this.isLoadingFile) return;

                        hits.push(node);
                        count++;

                        if (count >= 100) {
                            this.xmlFile = this.file;
                            this.dataset = Object.freeze(hits);
                            this.isLoadingFile = false;
                            this.sample = true;
                            stream.pause();
                        }
                    });

                    const stream = new FileStreamer(this.file, () => {
                        if (hits.length <= 0) {
                            this.xmlError = `No node &lt;${escapeHtml(this.xmlRootNode)}&gt; found in the first 10MB of the file.<br>Change it and press enter`;
                        } else {
                            this.xmlFile = this.file;
                            this.dataset = Object.freeze(hits);
                        }
                        this.isLoadingFile = false;
                        parser.close();
                    });

                    let i = 0;
                    stream.start((data) => {
                        if (i >= 10) {
                            if (hits.length > 0) {
                                this.xmlFile = this.file;
                                this.dataset = Object.freeze(hits);
                                this.isLoadingFile = false;
                                this.sample = true;
                            } else  {
                                this.xmlError = `No node &lt;${escapeHtml(this.xmlRootNode)}&gt; found in the first 10MB of the file.<br>Change it and press enter`;
                                this.isLoadingFile = false;
                            }

                            stream.pause();
                            parser.close();
                            return;
                        }
                        i++;
                        parser.write(data);
                    });
                }
            },
            loadIndex: async function (noReset) {
                if (!noReset) {
                    this.reset();
                }

                if (!this.indexInfo.appId || !this.indexInfo.indexName || !this.apiKey) return;

                const index = await getSearchIndex(this.indexInfo.appId, this.apiKey, this.indexInfo.indexName);
                const res = await index.search('', {attributesToRetrieve: ['*'], attributesToHighlight: [], attributesToSnippet: []});

                if (this.extraObjectID.length > 0) {
                    const extraObject = await index.getObject(this.extraObjectID, {attributesToRetrieve: ['*']});
                    res.hits.unshift(extraObject);
                }

                const dataset = res.hits;
                this.dataset = Object.freeze(dataset);
                this.nbHits = res.nbHits;
                this.sample = res.nbHits > this.dataset.length;
                this.$emit('onUpdateIndexInfo', this.indexInfo);
            }
        }
    }
</script>
