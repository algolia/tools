<template>
    <internal-app>
        <div class="pb-24">
            <app-header app-name="Index Differ">
                <display-config class="mx-16 mt-0 ml-auto"/>
            </app-header>
            <app-management />
            <div class="m-12">
                <h3 class="mt-24 tracking-wide uppercase text-solstice-blue">Compare</h3>
                <div class="flex">
                    <div class="h-0p my-12 rounded border border-proton-grey-opacity-60 text-solstice-blue bg-proton-grey-opacity-40">
                        <div class="flex items-center w-full justify-between p-12 pb-8">
                            <div class="flex">
                                <app-selector v-model="refIndexInfo.appId" class="mb-4" />
                                <index-selector v-model="refIndexInfo.indexName" :app-id="refIndexInfo.appId" class="ml-12 mb-4" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="ml-24 my-12 rounded border border-proton-grey-opacity-60 text-solstice-blue bg-proton-grey-opacity-40">
                            <div class="flex items-center w-full justify-between p-16">
                                <div class="flex items-center">
                                    <label class="mr-16 flex">
                                        <input type="radio" name="tab" value="settings" v-model="currentTab" />
                                        <span class="ml-4">Settings</span>
                                    </label>
                                    <label class="mr-16 flex">
                                        <input type="radio" name="tab" value="synonyms" v-model="currentTab" />
                                        <span class="ml-4">Synonyms</span>
                                    </label>
                                    <label class="mr-16 flex">
                                        <input type="radio" name="tab" value="rules" v-model="currentTab" />
                                        <span class="ml-4">Rules</span>
                                    </label>
                                    <label class="flex">
                                        <input type="radio" name="tab" value="records" v-model="currentTab" />
                                        <span class="ml-4">Records</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div v-if="currentTab === 'records'" class="ml-24 my-12 rounded border border-proton-grey-opacity-60 text-solstice-blue bg-proton-grey-opacity-40">
                            <div class="flex justify-start px-16 py-8">
                                <params
                                    class="w-300"
                                    id="differ"
                                    config-key="searchParams"
                                    :params="editableParams"
                                    :ref-params="editableParams"
                                    :raw-params="editableParams"
                                    :keys="Object.keys(editableParams)"
                                    :keys-indexer="null"
                                    :mutate="true"
                                    @onMutate="onMutate"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="h-0p ml-24 my-12 p-16 rounded border border-proton-grey-opacity-60 text-solstice-blue bg-proton-grey-opacity-40">
                        <div class="flex w-full">
                            <label class="mr-16">
                                <div class="flex">
                                    <input type="checkbox" class="mr-8" v-model="filters.untouched">
                                    <div>Untouched</div>
                                </div>
                            </label>
                            <label class="mr-16">
                                <div class="flex">
                                    <input type="checkbox" class="mr-8" v-model="filters.added">
                                    <div>Added</div>
                                </div>
                            </label>
                            <label class="mr-16">
                                <div class="flex">
                                    <input type="checkbox" class="mr-8" v-model="filters.deleted">
                                    <div>Deleted</div>
                                </div>
                            </label>
                            <label>
                                <div class="flex">
                                    <input type="checkbox" class="mr-8" v-model="filters.modified">
                                    <div>Modified</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                <h3 class="mt-24 tracking-wide uppercase text-solstice-blue">With</h3>
                <div class="flex mt-12">
                    <div v-for="(indexInfo, i) in indices">
                        <div class="rounded border border-proton-grey-opacity-60 mr-24 overflow-hidden">
                            <div class="bg-proton-grey-opacity-40">
                                <div class="flex w-full justify-between p-16">
                                    <div class="flex w-full items-center">
                                        <app-selector v-model="indexInfo.appId" class="mb-4" />
                                        <index-selector v-model="indexInfo.indexName" :app-id="indexInfo.appId" class="ml-12 mb-4" />
                                        <swap-icon
                                            @click="swapIndex(i)"
                                            class="ml-auto rotate-90 -mt-8 w-16 h-16 cursor-pointer text-solstice-blue"
                                        />
                                        <x-icon
                                            @click="indices.splice(i, 1)"
                                            class="ml-8 -mt-8 w-16 h-16 cursor-pointer text-solstice-blue"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white">
                                <index
                                    :app-id="indexInfo.appId"
                                    :index-name="indexInfo.indexName"
                                    :ref-app-id="refIndexInfo.appId"
                                    :ref-index-name="refIndexInfo.indexName"
                                    :current-tab="currentTab"
                                    :filters="filters"
                                    @onIndexChanged="updateUrl()"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="text-center">
                        <div v-if="refIndexInfo.replicas.length > 0 || refIndexInfo.primary">
                            <div v-if="refIndexInfo.replicas.length > 0">
                                <div class="mb-16">Load a replica</div>
                                <div
                                    v-for="(replica, i) in refIndexInfo.replicas"
                                    class="mb-16 p-16 rounded border border-dashed border-telluric-blue-opacity-40 cursor-pointer text-telluric-blue"
                                    @click="indices.push({appId: refIndexInfo.appId, indexName: replica})"
                                >
                                    {{replica}}
                                </div>
                            </div>
                            <div v-if="refIndexInfo.primary">
                                <div class="mb-16">Load the primary</div>
                                <div
                                    class="mb-16 p-16 rounded border border-dashed border-telluric-blue-opacity-40 cursor-pointer text-telluric-blue"
                                    @click="indices.push({appId: refIndexInfo.appId, indexName: refIndexInfo.primary})"
                                >
                                    {{refIndexInfo.primary}}
                                </div>
                            </div>
                            <div class="mb-16">
                                or
                            </div>
                        </div>
                        <div
                            v-if="refIndexInfo.replicas.length >= 2"
                            @click="addAllReplicas()"
                            class="mb-16 p-16 rounded border border-dashed border-telluric-blue-opacity-40 cursor-pointer text-telluric-blue"
                        >
                                load all replicas
                        </div>
                        <div
                            @click="indices.push({appId: refIndexInfo.appId, indexName: refIndexInfo.indexName})"
                            class="mb-16 p-16 rounded border border-dashed border-telluric-blue-opacity-40 cursor-pointer text-telluric-blue"
                        >
                            load another index
                        </div>
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
    import Params from "common/components/params/Params";
    import SmallTabs from "common/components/tabs/SmallTabs";
    import XIcon from "common/icons/x.svg";
    import SwapIcon from "common/icons/swap.svg";

    import Index from "./Index";
    import {getClient} from "common/utils/algoliaHelpers";

    export default {
        name: 'IndexDiffer',
        components: {
            Index, InternalApp, DisplayConfig, AppHeader, AppManagement, AppSelector, IndexSelector, SmallTabs, Params, XIcon, SwapIcon},
        data: function () {
            return {
                refIndexInfo: {
                    appId: 'AJ0P3S7DWQ',
                    indexName: 'movies',
                    index: null,
                    replicas: [],
                    primary: null,
                },
                filters: {
                    untouched: true,
                    added: true,
                    deleted: true,
                    modified: true,
                },
                indices: [],
                editableParams: {},
            };
        },
        created: function () {
            const url = new URL(window.location.href);
            const refAppId = url.searchParams.get("ref-app-id");
            const refIndexName = url.searchParams.get("ref-index-name");
            const indices = url.searchParams.get("indices");

            if (refAppId && refIndexName) {
                this.$set(this.refIndexInfo, 'appId', refAppId);
                this.$set(this.refIndexInfo, 'indexName', refIndexName);
            }

            if (indices) {
                try {
                    const parsedIndices = JSON.parse(indices);
                    if (Array.isArray(parsedIndices)) {
                        const indicesToLoad = [];
                        parsedIndices.forEach((indexInfo) => {
                            if (indexInfo && typeof indexInfo === 'object' && indexInfo.constructor === Object) {
                                if (indexInfo.appId && indexInfo.indexName) {
                                    indicesToLoad.push({appId: indexInfo.appId, indexName: indexInfo.indexName});
                                }
                            }
                        });
                        if (indicesToLoad.length > 0) {
                            this.indices = indicesToLoad;
                        }
                    }
                } catch (e) {}
            }


            this.updateUrl();
            this.loadReplicas();
        },
        watch: {
            'refIndexInfo.appId': function () {
                this.loadReplicas();
                this.updateUrl();
            },
            'refIndexInfo.indexName': function () {
                this.loadReplicas();
                this.updateUrl();
            },
            indices: {
                deep: true,
                handler: function () {
                    this.updateUrl();
                }
            }
        },
        computed: {
            currentTab: {
                get () {
                    return this.$store.state.indexdiffer.currentTab || 'settings';
                },
                set (tabName) {
                    this.$store.commit(`indexdiffer/setCurrentTab`, tabName);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.refIndexInfo.appId].key;
            }
        },
        methods: {
            onMutate: function () {
                const params = {};
                Object.keys(this.editableParams).forEach((key) =>  {
                    params[key] = JSON.parse(JSON.stringify(this.editableParams[key].value));
                });

                this.$root.$emit('onUpdateBrowseParams', params);
            },
            loadReplicas: async function () {
                if (!this.refIndexInfo.appId || !this.refIndexInfo.indexName || !this.apiKey) return;

                const client = await getClient(this.refIndexInfo.appId, this.apiKey);
                const index = client.initIndex(this.refIndexInfo.indexName);
                const settings = await index.getSettings();

                if (Array.isArray(settings.replicas) && settings.replicas.length > 0) {
                    this.refIndexInfo.replicas = settings.replicas;
                } else {
                    this.refIndexInfo.replicas = [];
                }

                if (settings.primary) {
                    this.refIndexInfo.primary = settings.primary;
                } else {
                    this.refIndexInfo.primary = null;
                }
            },
            addAllReplicas: function () {
                this.refIndexInfo.replicas.forEach((replica) => {
                    this.indices.push({appId: this.refIndexInfo.appId, indexName: replica})
                })
            },
            swapIndex: function (i) {
                const tmpAppId = this.indices[i].appId;
                const tmpIndexName = this.indices[i].indexName;

                this.indices[i].appId = this.refIndexInfo.appId;
                this.indices[i].indexName = this.refIndexInfo.indexName;

                this.refIndexInfo.appId = tmpAppId;
                this.refIndexInfo.indexName = tmpIndexName;
            },
            updateUrl: function () {
                const url = `${window.location.origin}${window.location.pathname}?ref-app-id=${this.refIndexInfo.appId}&ref-index-name=${this.refIndexInfo.indexName}&indices=${encodeURIComponent(JSON.stringify(this.indices))}`;
                window.history.replaceState(null, null, url);
            }
        }
    }
</script>
