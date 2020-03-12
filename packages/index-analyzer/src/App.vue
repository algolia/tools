<template>
    <internal-app>
        <div class="min-h-screen pb-48">
            <app-header app-name="Index Analyzer">
                <display-config class="mx-16 mt-0 ml-auto" />
            </app-header>
            <div class="px-48 mt-24">
                <app-management />
                <div class="max-w-960 mx-auto mt-24">
                    <div class="rounded border border-proton-grey-opacity-60 mt-24">
                        <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                            <app-selector v-model="appId" />
                            <index-selector
                                v-model="indexName"
                                :app-id="appId"
                                class="ml-24"
                            />
                            <input placeholder="attributeName" class="rounded mx-24 px-4 flex-grow" v-model="attributeName" />
                        </div>
                        <div class="bg-white text-nova-grey">
                            <metrics
                                :app-id="appId"
                                :index-name="indexName"
                                :attribute-name="attributeName"
                                @onUpdateAttributeName="attributeName = $event"
                            />
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
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';
    import Metrics from "./Metrics";

    export default {
        name: 'App',
        components: {Metrics, InternalApp, AppHeader, AppManagement, DisplayConfig, AppSelector, IndexSelector},
        computed: {
            appId: {
                get () {
                    return this.$store.state.indexanalyzer.appId || null;
                },
                set (appId) {
                    this.attributeName = '';
                    this.$store.commit(`indexanalyzer/setAppId`, appId);
                }
            },
            indexName: {
                get () {
                    return this.$store.state.indexanalyzer.indexName || null;
                },
                set (indexName) {
                    this.attributeName = '';
                    this.$store.commit(`indexanalyzer/setIndexName`, indexName);
                }
            },
            attributeName: {
                get () {
                    return this.$store.state.indexanalyzer.attributeName || '';
                },
                set (attributeName) {
                    this.$store.commit(`indexanalyzer/setAttributeName`, attributeName);
                }
            }
        }
    }
</script>
