<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Insights UI" />
            <div class="max-w-960 mx-auto mt-24 pb-24">
                <div class="bg-white rounded border border-proton-grey-opacity-60">
                    <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                        <app-selector v-model="appId" class="mr-16" />
                        <index-selector v-model="indexName" :app-id="appId" class="" />
                        <index-new v-if="appId" :app-id="appId" :api-key="apiKey" @onIndexCreated="onIndexCreated" class="mr-16 pb-4" />
                        <analytics-region-selector v-model="region" class="ml-auto" />
                    </div>
                    <div class="p-16" v-if="appId && indexName">
                        <event
                            :app-id="appId"
                            :index-name="indexName"
                            :api-key="apiKey"
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
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import IndexNew from "common/components/index/IndexNew";
    import Event from "./Event";
    import AnalyticsRegionSelector from "common/components/selectors/AnalyticsRegionSelector";

    export default {
        name: 'Home',
        components: {Event, InternalApp, AppHeader, AppSelector, IndexSelector, AnalyticsRegionSelector, IndexNew},
        data: function () {
            return {
                appId: null,
                indexName: null,
                region: 'us',
            }
        },
        computed: {
            apiKey: function () {
                return this.$store.state.apps[this.appId].key;
            },
        },
        methods: {
            onIndexCreated: function (indexName) {
                this.indexName = indexName;
            }
        }
    }
</script>
