<template>
    <div class="flex text-solstice-blue">
        <app-selector
            :apps="$store.state.apps"
            v-model="appId"
        />
        <custom-select
            v-if="!freeIndexName"
            v-model="indexInfo"
            class="min-w-140"
            string-value-attribute="name"
            :options="indices"
            :refine="refine"
        >
            <template slot="icon"><list-icon class="block w-12 h-12 mr-8 fill-current"/></template>
            <template v-slot:default="{option, inDropDown, isSelected, highlightString}">
                <div v-html="inDropDown ? highlightString(option.name) : option.name"></div>
                <div v-if="inDropDown" class="ml-auto"></div>
                <div
                    v-if="inDropDown"
                    class="ml-16"
                    :class="isSelected ? 'text-white': 'text-solstice-blue-opacity-50'"
                >
                    {{option.entries}} records
                </div>
            </template>
        </custom-select>
        <input
            ref="freeIndexName"
            v-model="indexName"
            v-if="freeIndexName"
            class="input-custom mr-8 w-124"
        >
    </div>
</template>

<script>
    import Vue from "vue"
    import BoxIcon from "common/icons/box.svg";
    import ListIcon from "common/icons/list.svg";
    import CustomSelect from "@/html-elements/CustomSelect";
    import AppSelector from "./AppSelector";

    export default {
        name: "IndexSelector",
        components: {AppSelector, CustomSelect, BoxIcon, ListIcon},
        props: ["initialAppId", "initialIndexName", "setIndex", "freeIndexName"],
        data: function () {
            return {
                allIndices: [],
                indices: [],
                appId: this.initialAppId,
                indexInfo: {
                    name: this.initialIndexName,
                },
                nbPages: 1,
                maxNbPagesInMemory: 5,
            };
        },
        computed: {
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
        created: function () {
            this.updateIndices(false);
        },
        watch: {
            initialIndexName: function () {
                this.indexInfo.name = this.initialIndexName;
            },
            initialAppId: function () {
                this.appId = this.initialAppId;
            },
            appId: function () {
                this.setIndex(this.appId, this.freeIndexName ? this.indexInfo.name : null);
                this.updateIndices(true);
            },
            indexName: function () {
                this.setIndex(this.appId, this.indexInfo.name);
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
            updateIndices: async function (setIndex) {
                if (this.freeIndexName) return;
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

                if (setIndex || this.initialIndexName === null) {
                    this.indexInfo.name = this.$store.state.apps[this.appId].lastIndexName || this.indices[0].name;
                    this.setIndex(this.appId, this.indexInfo.name);
                }
            },
        }
    };
</script>