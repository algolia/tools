<template>
    <div>
        <h2 class="text-solstice-blue-opacity-80">Extract</h2>
        <div class="flex mt-24">
            <div
                @click="setType('index')"
                class="w-200 cursor-pointer mr-24 text-center rounded border border-proton-grey-opacity-60 p-24"
                :class="type === 'index' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                Algolia Index
            </div>
            <div
                @click="setType('json')"
                class="w-200 cursor-pointer mr-24 text-center rounded border border-proton-grey-opacity-60 p-24"
                :class="type === 'json' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                JSON
            </div>
            <div
                @click="setType('csv')"
                class="w-200 cursor-pointer mr-24 text-center rounded border border-proton-grey-opacity-60 p-24"
                :class="type === 'csv' ? 'bg-proton-grey-opacity-40' : 'bg-white'"
            >
                CSV
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
                    </div>
                </div>
                <div v-if="type === 'csv'" class="mt-24">
                    Delimitor:
                    <select class="bg-white" v-model="delimitor">
                        <option value=",">,</option>
                        <option value=";">;</option>
                        <option value="\t">\t</option>
                        <option value="#">#</option>
                    </select>
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
    import {dsvFormat} from 'd3-dsv';

    export default {
        name: 'DatasetSelector',
        components: {AppSelector, IndexSelector},
        data: function () {
            return {
                type: null,
                url: '',
                rawDataSetString: '',
                dataset: null,
                isLoadingFile: false,
                isDragring: false,
                indexInfo: {
                    appId: null,
                    indexName: null,
                },
                nbHits: null,
                delimitor: ',',
            }
        },
        watch: {
            dataset: function () {
                this.$emit('onUpdateDataset', this.dataset);
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
                this.isLoadingFile = false;
                this.dataset = null;
                this.$emit('onUpdateIndexInfo', null);
            },
            addFile: function (e) {
                this.reset();
                let droppedFiles = e.dataTransfer.files;
                if(!droppedFiles) return;

                const files = [...droppedFiles];
                const file = files[0];

                const reader = new FileReader();

                reader.onload = (e) => {
                    const dataText = e.target.result;

                    if (this.type === 'json') {
                        const dataset = JSON.parse(dataText);
                        this.dataset = Object.freeze(dataset);
                    }

                    if (this.type === 'csv') {
                        const dataset = [...dsvFormat(this.delimitor).parse(dataText)];
                        this.dataset = Object.freeze(dataset);
                    }

                    this.isLoadingFile = false;
                };

                this.isLoadingFile = true;
                reader.readAsText(file, "UTF-8");
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
