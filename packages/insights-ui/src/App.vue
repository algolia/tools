<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Insights UI">
                <display-config class="mt-0 ml-auto"/>
            </app-header>
            <app-management @onAddedAppId="appId = $event" />
            <div class="max-w-960 mx-auto mt-24 pb-24">
                <div class="bg-white rounded border border-proton-grey-opacity-60">
                    <div class="flex bg-white p-8 pb-12 border-nova-grey-opacity-20 bg-proton-grey-opacity-80 text-telluric-blue">
                        <app-selector v-model="appId" class="mr-16" />
                        <index-selector v-model="indexName" :app-id="appId" class="" allow-free-text="true"/>
                    </div>
                    <div v-if="indexData && this.apiKey">
                        <div class="flex bg-proton-grey-opacity-40 text-telluric-blue">
                            <div
                                class="mx-8 p-8 -mb-2 cursor-pointer"
                                :class="tab === 'click' ? 'border-b-2 border-nebula-blue-opacity-80' : ''"
                                @click="tab = 'click'"
                            >
                                Click Analytics
                            </div>
                            <div
                                class="mx-8 p-8 -mb-2 cursor-pointer"
                                :class="tab === 'perso' ? 'border-b-2 border-nebula-blue-opacity-80' : ''"
                                @click="tab = 'perso'"
                            >
                                Perso
                            </div>
                        </div>
                        <div class="p-16">
                            <click-analytics-event
                                v-if="tab === 'click'"
                                :app-id="appId"
                                :index-name="indexName"
                                :api-key="apiKey"
                                :aa="aa"
                            />
                            <div
                                v-if="tab === 'perso'"
                            >
                                <settings-loader :app-id="appId" :api-key="apiKey" :index-name="indexName" />
                                <strategy :app-id="appId" :api-key="apiKey" />
                                <perso-event
                                    :aa="aa"
                                    :app-id="appId"
                                    :index-name="indexName"
                                    :api-key="apiKey"
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
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import AppManagement from "common/components/configuration/AppManagement";
    import SettingsLoader from "common/components/explorer/results/SettingsLoader";
    import PersoEvent from "./PersoEvent";
    import ClickAnalyticsEvent from "./ClickAnalyticsEvent";
    import Strategy from "./Strategy";
    import aa from "search-insights";
    import DisplayConfig from "./DisplayConfig";
    import indexInfoMixin from "common/mixins/indexInfoMixin";

    export default {
        name: 'Home',
        components: {Strategy, ClickAnalyticsEvent, InternalApp, AppHeader, AppSelector, IndexSelector, PersoEvent, SettingsLoader, AppManagement, DisplayConfig},
        mixins: [indexInfoMixin],
        watch: {
            appReady: function (val) {
                if (!val) {
                    this.$store.commit('insightsui/setAppId', null);
                    this.$store.commit('insightsui/setIndexName', null);
                }
            }
        },
        computed: {
            appReady: function () {
                return this.$store.state.apps[this.appId];
            },
            appId: {
                get () {
                    return this.$store.state.insightsui.appId;
                },
                set (val) {
                    this.$store.commit('insightsui/setAppId', val);
                }
            },
            indexName: {
                get () {
                    return this.$store.state.insightsui.indexName;
                },
                set (val) {
                    this.$store.commit('insightsui/setIndexName', val);
                }
            },
            tab: {
                get () {
                    return this.$store.state.insightsui.tab;
                },
                set (val) {
                    this.$store.commit('insightsui/setTab', val);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId] ? this.$store.state.apps[this.appId].key : '';
            },
            aa: function () {
                aa('init', {
                    appId: this.appId,
                    apiKey: this.apiKey,
                });

                return aa;
            }
        },
        methods: {
            onIndexCreated: function (indexName) {
                this.indexName = indexName;
            }
        }
    }
</script>
