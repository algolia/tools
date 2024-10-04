<template>
    <custom-select
        v-model="indexInfo"
        class="min-w-140 border-b border-telluric-blue-opacity-60 text-solstice-blue pb-4"
        string-value-attribute="name"
        :options="indicesWithForced"
        :refine="refine"
        :allow-free-text="allowFreeText"
    >
        <template slot="icon"><list-icon class="block w-12 h-12 mr-8 -mt-1 fill-current"/></template>
        <template v-slot:default="{option, inDropDown, isSelected, highlightString}">
            <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
            <div v-html="inDropDown ? highlightString(escapeHtml(option.name)) : escapeHtml(option.name)"></div>
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
    import {getClient} from "../../utils/algoliaHelpers";
    import {escapeHtml} from "../../utils/formatters";

    export default {
        name: "IndexSelector",
        components: {AppSelector, CustomSelect, BoxIcon, ListIcon},
        props: ["appId", "value", "forcedIndices", "allowFreeText", "noFetch"],
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
            this.registerIndex();
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
                if (!this.$store.state.apps[this.appId]) return null;
                return this.$store.state.apps[this.appId].key;
            },
        },
        watch: {
            value: function () {
                this.indexInfo.name = this.value;
            },
            appId: function () {
                this.indexName = this.value;
                this.$emit('input', null);
                this.updateIndices(true);
            },
            indexName: function () {
                if (this.indexInfo.name !== this.value) {
                    this.$emit('input', this.indexInfo.name);
                }
                this.registerIndex();
                this.updateIndices(false);
            },
            adminAPIKey: function () {
                this.updateIndices(true);
            }
        },
        methods: {
            registerIndex: function () {
                if (!this.appId) return; // onboarding

                if (this.indexInfo.name) {
                    this.$store.commit(`apps/${this.appId}/addIndex`, this.indexName);
                    ['searchParams', 'searchParams2'].forEach((k) => {
                        this.$store.commit(`apps/${this.appId}/${this.indexName}/deleteParam`, {
                            configKey: k,
                            inputKey: 'page'
                        });
                    });
                }
            },
            refine: async function (query) {
                if (!this.appId || !this.adminAPIKey) return; // onboarding

                if (query.length <= 0) {
                    this.indices = this.allIndices;
                    return;
                }

                if (this.nbPages > this.maxNbPagesInMemory) {
                    const client = await getClient(this.appId, this.adminAPIKey);
                    const data = await client.listIndices({
                        queryParameters: {
                            page: 0,
                            prefix: encodeURIComponent(query),
                        }
                    });
                    this.indices = data.items.sort((a, b) => {
                        if (a.updatedAt < b.updatedAt) return 1;
                        if (a.updatedAt > b.updatedAt) return -1;
                        return 0;
                    });
                } else {
                    const words = query.split(' ');

                    this.indices = this.allIndices.filter(function (indexInfo) {
                        return words.every(function (word) {
                            return indexInfo.name.toLowerCase().indexOf(word.toLowerCase()) !== -1;
                        });
                    }).sort((a, b) => {
                        if (a.name === query) return -1;
                        if (b.name === query) return 1;
                        return 0;
                    });
                }
            },
            updateIndices: async function (shouldSetIndex) {
                if (!this.appId || !this.adminAPIKey || this.noFetch) return; // onboarding

                const client = await getClient(this.appId, this.adminAPIKey);

                let data = await client.listIndices({
                    queryParameters: {
                        page: 0
                    }
                });
                this.nbPages = data.nbPages;

                if (this.nbPages > 1 && this.nbPages <= this.maxNbPagesInMemory) {
                    data = await client.listIndices();
                }

                this.allIndices = data.items.sort((a, b) => {
                    if (a.updatedAt < b.updatedAt) return 1;
                    if (a.updatedAt > b.updatedAt) return -1;
                    return 0;
                });
                this.indices = this.allIndices;

                if (this.indices.length <= 0) return;

                if ((shouldSetIndex && this.indexInfo.name !== this.value) || this.value === null) {
                    this.indexInfo.name = this.value ? this.value : (this.$store.state.apps[this.appId].lastIndexName || this.indices[0].name);
                    this.$emit('input', this.indexInfo.name);
                }
            },
            escapeHtml,
        }
    };
</script>
