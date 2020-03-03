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
                JSON (small/medium size)
            </div>
        </div>
        <div v-if="['json', 'csv'].includes(type)">
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
                    <div class="mt-24" v-if="isLoadingFile">Loading ...</div>
                    <div v-if="dataset && dataset.length > 0" class="mt-24">
                        {{dataset.length}} records loaded
                        <span v-if="sample">
                            (This is a sample, csv will be fully loaded during the apply step)
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type === 'index'">
            <div class="mt-24 flex">
                <div class="flex">
                    <app-selector v-model="indexInfo.appId" />
                    <index-selector
                        v-model="indexInfo.indexName"
                        :app-id="indexInfo.appId"
                        class="ml-24"
                    />
                </div>
            </div>
            <div v-if="nbHits" class="mt-24">
                {{nbHits}} records loaded
            </div>
        </div>
    </div>
</template>

<script>
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import Papa from 'papaparse';

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
                isLoadingFile: false,
                isDragring: false,
                sample: false,
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
            indexInfo: {
                deep: true,
                handler: function () {
                    this.loadIndex();
                }
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
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataText = e.target.result;

                        const dataset = JSON.parse(dataText);
                        this.dataset = Object.freeze(dataset);

                        this.isLoadingFile = false;
                    };
                    this.isLoadingFile = true;
                    reader.readAsText(file, "UTF-8");
                } else { // csv
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
                            //parser.pause();
                            //parser.resume();
                        },
                        error: function () { count++; },
                        complete: (results) => {
                            this.csvFile = file;
                            this.dataset = Object.freeze(hits);
                            this.isLoadingFile = false;
                        }
                    });
                }
            },
            loadIndex: async function () {
                this.reset();
                if (!this.indexInfo.appId || !this.indexInfo.indexName || !this.apiKey) return;

                const index = await getSearchIndex(this.indexInfo.appId, this.apiKey, this.indexInfo.indexName);
                const res = await index.search('', {attributesToHighlight: [], attributesToSnippet: []});

                const dataset = res.hits;
                this.dataset = Object.freeze(dataset);
                this.nbHits = res.nbHits;
                this.$emit('onUpdateIndexInfo', this.indexInfo);
            }
        }
    }
</script>
