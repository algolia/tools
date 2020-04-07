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
                :class="type === 'json' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                XML (∞ size)
            </div>
        </div>
        <div v-if="['json', 'csv', 'xml'].includes(type)">
            <div class="mt-24">
                <div>
                    <div
                        class="border rounded p-48"
                        :class="isDragring ? 'border-mars-1' : 'border-proton-grey-opacity-60'"
                        v-cloak
                        @dragenter="isDragring = true"
                        @dragleave="isDragring = false"
                        @drop="isDragring = false"
                        @drop.prevent="addFile"
                        @dragover.prevent
                    >
                        {{ isDragring ? 'Drop file here' : 'Drag file here' }}
                    </div>
                    <div v-if="type === 'xml'" class="flex mt-24">
                        Xml node name:
                        <input
                            type="text"
                            v-model="xmlRootNode"
                            class="input-custom ml-8 w-124"
                        />
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
                rawDataSetString: '',
                dataset: null,
                csvFile: null,
                jsonFile: null,
                xmlFile: null,
                extraObjectID: '',
                isLoadingFile: false,
                isDragring: false,
                sample: false,
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
            xmlRootNode: function () {
                this.$emit('onUpdateXmlRootNode', this.xmlRootNode);
                this.loadIndex(true);
            }
        },
        computed: {
            apiKey: function () {
                return this.indexInfo.appId && this.$store.state.apps[this.indexInfo.appId] ? this.$store.state.apps[this.indexInfo.appId].key : '';
            },
        },
        methods: {
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
                this.$emit('onUpdateIndexInfo', null);
            },
            addFile: function (e) {
                this.reset();
                let droppedFiles = e.dataTransfer.files;
                if(!droppedFiles) return;

                const files = [...droppedFiles];
                const file = files[0];

                if (this.type === 'json') {
                    this.isLoadingFile = true;

                    let count = 0;
                    let hits = [];

                    const stream = new FileStreamer(file, () => {
                        this.jsonFile = file;
                        this.dataset = Object.freeze(hits);
                        this.isLoadingFile = false;
                    });

                    const oboeStream = oboe();
                    oboeStream.node('!.[*]', (node) => {
                        if (!this.isLoadingFile) return;

                        hits.push(node);
                        count++;

                        if (count >= 100) {
                            this.jsonFile = file;
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
                    Papa.parse(file, {
                        header: true,
                        delimitersToGuess: [',', ';', '\t', '#'],
                        preview: 100,
                        step: async (lineObject, parser) => {
                            hits.push(lineObject.data);
                            count++;
                            if (count >= 100) {
                                this.csvFile = file;
                                this.dataset = Object.freeze(hits);
                                this.isLoadingFile = false;
                                this.sample = true;
                            }
                        },
                        error: function () { count++; },
                        complete: (results) => {
                            this.csvFile = file;
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
                            this.xmlFile = file;
                            this.dataset = Object.freeze(hits);
                            this.isLoadingFile = false;
                            this.sample = true;
                            stream.pause();
                        }
                    });

                    const stream = new FileStreamer(file, () => {
                        this.xmlFile = file;
                        this.dataset = Object.freeze(hits);
                        this.isLoadingFile = false;
                        parser.close();
                    });

                    stream.start(function (data) {
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
