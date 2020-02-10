<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Insights UI" />
            <div class="max-w-960 mx-auto mt-24 pb-24">
                <div class="bg-white rounded border border-proton-grey-opacity-60">
                    <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                        <app-selector v-model="appId" class="mr-16" />
                        <index-selector v-model="indexName" :app-id="appId" class="" />
                    </div>
                    <div class="p-16" v-if="appId && indexName">
                        <div>
                            <small-tabs
                                :tabs="[{ value: 'click', name: 'Click Analytics' }, { value: 'perso', name: 'Perso' }]"
                                v-model="tab"
                            />
                        </div>
                        <div class="mt-24">
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
                                <perso-event
                                    :aa="aa"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="tab === 'perso'"
                    class="mt-24 p-16 bg-white rounded border border-proton-grey-opacity-60"
                >
                    <Strategy :app-id="appId" :api-key="apiKey" />
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
    import SmallTabs from 'common/components/tabs/SmallTabs';
    import PersoEvent from "./PersoEvent";
    import ClickAnalyticsEvent from "./ClickAnalyticsEvent";
    import Strategy from "./Strategy";
    import aa from "search-insights";

    export default {
        name: 'Home',
        components: {Strategy, ClickAnalyticsEvent, InternalApp, AppHeader, AppSelector, IndexSelector, SmallTabs, PersoEvent},
        computed: {
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
                return this.$store.state.apps[this.appId].key;
            },
            aa: function () {
                aa.init({
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
