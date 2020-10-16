<template>
    <internal-app>
        <div class="min-h-screen pb-48">
            <app-header app-name="Merchandizer">
                <display-config class="mt-0 ml-auto" />
            </app-header>
            <div class="px-48 mt-24">
                <app-management />
            </div>
            <div class="flex">
                <div class="flex mx-auto">
                    <div class="max-w-960 mt-24">
                        <div class="flex items-center px-16 bg-white rounded border border-proton-grey-opacity-80">
                            <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
                            <input
                                class="flex-1 block h-full py-8 bg-transparent text-telluric-blue leading-normal"
                                placeholder="Search query"
                                v-model="query"
                            >
                        </div>
                        <div class="rounded border border-proton-grey-opacity-60 mt-24">
                            <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                                <app-selector v-model="appId" />
                                <index-selector
                                    v-model="indexName"
                                    :app-id="appId"
                                    class="ml-24"
                                />
                            </div>
                            <div class="bg-white text-nova-grey p-8">
                                <hits-preview
                                    :appId="appId"
                                    :indexName="indexName"
                                    :apiKey="apiKey"
                                    :query="query"
                                    :config="config"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="ml-24 w-512 min-w-512 mt-24">
                        <div class="flex">
                            <div class="mr-12 p-8 bg-white rounded border border-proton-grey-opacity-60">Pin</div>
                            <div class="mr-12 p-8 bg-white rounded border border-proton-grey-opacity-60">Hide</div>
                            <div class="mr-12 p-8 bg-white rounded border border-proton-grey-opacity-60">Boost</div>
                            <div class="mr-12 p-8 bg-white rounded border border-proton-grey-opacity-60">Bury</div>
                            <div class="mr-12 p-8 bg-white rounded border border-proton-grey-opacity-60">Filter</div>
                        </div>
                        <div class="rounded border border-proton-grey-opacity-60 mt-32">
                            <div class="bg-white p-8 bg-proton-grey-opacity-40 text-telluric-blue">
                                Applied Rules
                            </div>
                            <div class="bg-white text-nova-grey p-8">
                                <merch-applied-rules
                                    :appId="appId"
                                    :indexName="indexName"
                                    :apiKey="apiKey"
                                    :config="config"
                                />
                            </div>
                        </div>
                        <div v-if="config.mainIndexName === this.indexName" class="rounded border border-proton-grey-opacity-60 mt-32">
                            <div class="bg-white p-8 bg-proton-grey-opacity-40 text-telluric-blue">
                                Forward to index
                            </div>
                            <div class="bg-white text-nova-grey p-8">
                                <forward-to-index
                                    :appId="appId"
                                    :indexName="indexName"
                                    :apiKey="apiKey"
                                    :config="config"
                                />
                            </div>
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
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "./DisplayConfig";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import SearchIcon from 'common/icons/search.svg';
    import HitsPreview from "./HitsPreview";
    import config from "./config";
    import MerchAppliedRules from "./MerchAppliedRules";
    import ForwardToIndex from "./ForwardToIndex";

    export default {
        name: 'App',
        components: {
            ForwardToIndex,
            MerchAppliedRules,
            HitsPreview,
            InternalApp, AppHeader, AppManagement, DisplayConfig, AppSelector, IndexSelector, SearchIcon},
        data: function () {
            return {
                appId: null,
                indexName: null,
                query: 'london',
                config: config,
            }
        },
        computed: {
            apiKey: function () {
                if (this.$store.state.apps[this.appId]) {
                    return this.$store.state.apps[this.appId].key;
                }
                return '';
            }
        }
    }
</script>
