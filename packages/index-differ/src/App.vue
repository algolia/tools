<template>
    <internal-app>
        <div class="pb-24">
            <app-header app-name="Index Differ">
                <display-config class="mx-16 mt-0 ml-auto"/>
            </app-header>
            <app-management />
            <div class="max-w-960 mx-auto">
                <div class="rounded border border-proton-grey-opacity-60 mt-24">
                    <div class="p-8 border-b border-nova-grey-opacity-20 bg-proton-grey-opacity-80">
                        <div class="flex w-full justify-between">
                            <div class="flex">
                                <app-selector v-model="leftAppId" class="mb-4" />
                                <index-selector v-model="leftIndexName" :app-id="leftAppId" class="ml-12 mb-4" />
                            </div>
                            <div
                                v-if="leftAppId === rightAppId && leftIndexName === rightIndexName"
                                class="flex items-center border border-saturn-2 border-saturn-2 text-saturn-1 px-8 rounded"
                            >
                                <div>
                                    Diffing the same index
                                </div>
                            </div>
                            <div v-else class="flex items-center justify-center">
                                <swap-icon
                                    @click="swapIndex"
                                    class="w-24 h-24 cursor-pointer"
                                />
                            </div>
                            <div class="flex">
                                <app-selector v-model="rightAppId" class="mb-4" />
                                <index-selector v-model="rightIndexName" :app-id="rightAppId" class="ml-12 mb-4" />
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center bg-proton-grey-opacity-40 py-16">
                        <small-tabs
                            v-model="currentTab"
                            :tabs="[
                                {value: 'settings', name: 'Settings'},
                                {value: 'synonyms', name: 'Synonyms'},
                                {value: 'rules', name: 'Rules'},
                                {value: 'records', name: 'Records'},
                            ]"
                        />
                        <loaded-info
                            class="px-16 pt-16 text-telluric-blue"
                            :differ="differ"
                            :current-tab="currentTab"
                        />
                    </div>
                    <div class="bg-white">
                        <diffs
                            :differ="differ"
                            :current-tab="currentTab"
                        />
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import DisplayConfig from "@/index-differ/DisplayConfig";
    import AppManagement from "common/components/configuration/AppManagement";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import SmallTabs from "common/components/tabs/SmallTabs";
    import SwapIcon from "common/icons/swap.svg";
    import Diffs from "@/index-differ/Diffs";

    import Differ from "@/index-differ/differ";
    import {getSearchClient} from 'common/utils/algoliaHelpers';
    import LoadedInfo from "@/index-differ/LoadedInfo";

    export default {
        name: 'IndexDiffer',
        components: {
            LoadedInfo,
            InternalApp, SwapIcon, Diffs, DisplayConfig, AppHeader, AppManagement, AppSelector, IndexSelector, SmallTabs},
        data: function () {
            return {
                leftIndex: null,
                rightIndex: null,
                differ: null,
            };
        },
        created: async function () {
            const url = new URL(window.location.href);
            const leftAppId = url.searchParams.get("left-app-id");
            const leftIndexName = url.searchParams.get("left-index-name");
            const rightAppId = url.searchParams.get("right-app-id");
            const rightIndexName = url.searchParams.get("right-index-name");

            if (leftAppId && leftIndexName) {
                this.leftAppId = leftAppId;
                this.leftIndexName = leftIndexName
            } else if (!this.leftAppId && Object.keys(this.$store.state.apps).length > 0) {
                this.leftAppId = Object.keys(this.$store.state.apps)[0];
            }

            if (rightAppId && rightIndexName) {
                this.rightAppId = rightAppId;
                this.rightIndexName = rightIndexName
            } else if (!this.rightAppId && Object.keys(this.$store.state.apps).length > 0) {
                this.rightAppId = Object.keys(this.$store.state.apps)[0];
            }

            this.updateUrl();
            await this.getLeftIndex();
            await this.getRightIndex();
            this.loadDiffer();
        },
        computed: {
            leftAppId: {
                get () {
                    return this.$store.state.indexdiffer.leftAppId;
                },
                set (appId) {
                    this.leftIndexName = null;
                    this.$store.commit(`indexdiffer/setLeftAppId`, appId);
                    this.getLeftIndex();
                    this.updateUrl();
                    this.loadDiffer();
                }
            },
            leftIndexName: {
                get () {
                    return this.$store.state.indexdiffer.leftIndexName;
                },
                set (indexName) {
                    this.$store.commit('indexdiffer/setLeftIndexName', indexName);
                    this.getLeftIndex();
                    this.updateUrl();
                    this.loadDiffer();
                }
            },
            rightAppId: {
                get () {
                    return this.$store.state.indexdiffer.rightAppId;
                },
                set (appId) {
                    this.rightIndexName = null;
                    this.$store.commit(`indexdiffer/setRightAppId`, appId);
                    this.getRightIndex();
                    this.updateUrl();
                    this.loadDiffer();
                }
            },
            rightIndexName: {
                get () {
                    return this.$store.state.indexdiffer.rightIndexName;
                },
                set (indexName) {
                    this.$store.commit('indexdiffer/setRightIndexName', indexName);
                    this.getRightIndex();
                    this.updateUrl();
                    this.loadDiffer();
                }
            },
            currentTab: {
                get () {
                    return this.$store.state.indexdiffer.currentTab || 'settings';
                },
                set (tabName) {
                    this.$store.commit(`indexdiffer/setCurrentTab`, tabName);
                }
            },
        },
        methods: {
            loadDiffer: function () {
                if (!this.leftIndex || !this.rightIndex) return;
                this.differ = new Differ(this.leftIndex, this.rightIndex);
            },
            swapIndex: function () {
                const tmpAppId = this.leftAppId;
                const tmpIndexName = this.leftIndexName;

                this.leftAppId = this.rightAppId;
                this.leftIndexName = this.rightIndexName;
                this.rightAppId = tmpAppId;
                this.rightIndexName = tmpIndexName;
            },
            updateUrl: function () {
                const url = `${window.location.origin}${window.location.pathname}?left-app-id=${this.leftAppId}&left-index-name=${this.leftIndexName}&right-app-id=${this.rightAppId}&right-index-name=${this.rightIndexName}`;
                window.history.replaceState(null, null, url);
            },
            getLeftIndex: async function () {
                if (!this.leftAppId || !this.leftIndexName) return;
                const client = await getSearchClient(this.leftAppId, this.adminAPIKey(this.leftAppId));
                this.leftIndex = client.initIndex(this.leftIndexName);
            },
            getRightIndex: async function () {
                if (!this.rightAppId || !this.rightIndexName) return;
                const client = await getSearchClient(this.rightAppId, this.adminAPIKey(this.rightAppId));
                this.rightIndex = client.initIndex(this.rightIndexName);
            },
            adminAPIKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
        }
    }
</script>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Hind:400,600");
    @import "./src/assets/css/main";
</style>
