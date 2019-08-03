<template>
    <custom-select
        v-model="indexInfo"
        class="min-w-140"
        string-value-attribute="name"
        :options="indicesWithForced"
        :refine="refine"
    >
        <template slot="icon"><list-icon class="block w-12 h-12 mr-8 fill-current"/></template>
        <template v-slot:default="{option, inDropDown, isSelected, highlightString}">
            <div v-html="inDropDown ? highlightString(option.name) : option.name"></div>
            <div v-if="inDropDown" class="ml-auto"></div>
            <div
                v-if="inDropDown && option.entries !== undefined"
                class="ml-16"
                :class="isSelected ? 'text-white': 'text-solstice-blue-opacity-50'"
            >
                {{option.entries}} records
            </div>
        </template>
    </custom-select>
</template>

<script>
    import Vue from "vue"
    import BoxIcon from "../../icons/box.svg";
    import ListIcon from "../../icons/list.svg";
    import CustomSelect from "./CustomSelect";
    import AppSelector from "./AppSelector";

    export default {
        name: "IndexSelector",
        components: {AppSelector, CustomSelect, BoxIcon, ListIcon},
        props: ["appId", "value", "forcedIndices"],
        data: function () {
            return {
                allIndices: [],
                indices: [],
                indexInfo: {
                    name: this.value,
                },
                nbPages: 1,
                maxNbPagesInMemory: 5,
            };
        },
        created: function () {
            this.updateIndices(false);
        },
        computed: {
            indicesWithForced: function () {
                const forcedIndices = this.forcedIndices ? this.forcedIndices : [];
                return [...forcedIndices, ...this.indices];
            },
            indexName: {
                get () {
                    return this.indexInfo.name;
                },
                set(val) {
                    Vue.set(this.indexInfo, 'name', val);
                }
            },
            adminAPIKey: function () {
                return this.$store.state.apps[this.appId].key;
            },
            client: function () {
                return this.algoliasearch(this.appId, this.adminAPIKey);
            },
        },
        watch: {
            value: function () {
                this.indexInfo.name = this.value;
            },
            appId: function () {
                this.indexName = this.indexInfo.name;
                this.$emit('input', this.indexName);
                this.updateIndices(true);
            },
            indexName: function () {
                this.$emit('input', this.indexInfo.name);
                this.updateIndices(false);
            }
        },
        methods: {
            refine: async function (query) {
                if (query.length <= 0) {
                    this.indices = this.allIndices;
                    return;
                }
                if (this.nbPages > this.maxNbPagesInMemory) {
                    const data = await this.client.listIndexes('0&prefix=' + encodeURIComponent(query));
                    this.indices = data.items.sort((a, b) => {
                        if (a.updatedAt < b.updatedAt) return 1;
                        if (a.updatedAt > b.updatedAt) return -1;
                        return 0;
                    });
                } else {
                    const words = query.split(' ');

                    this.indices = this.allIndices.filter(function (indexInfo) {
                        return words.every(function (word) {
                            return indexInfo.name.indexOf(word) !== -1;
                        });
                    }).sort((a, b) => {
                        if (a.name === query) return -1;
                        if (b.name === query) return 1;
                        return 0;
                    });
                }
            },
            updateIndices: async function (shouldSetIndex) {
                if (this.appId === null) return; // onboarding

                let data = await this.client.listIndexes(0);
                this.nbPages = data.nbPages;

                if (this.nbPages > 1 && this.nbPages <= this.maxNbPagesInMemory) {
                    data = await this.client.listIndexes();
                }

                this.allIndices = data.items.sort((a, b) => {
                    if (a.updatedAt < b.updatedAt) return 1;
                    if (a.updatedAt > b.updatedAt) return -1;
                    return 0;
                });
                this.indices = this.allIndices;

                if (this.indices.length <= 0) return;

                if (shouldSetIndex || this.value === null) {
                    this.indexInfo.name = this.$store.state.apps[this.appId].lastIndexName || this.indices[0].name;
                    this.$emit('input', this.indexInfo.name);
                }
            },
        }
    };
</script>