<template>
    <div class="pb-24">
        <app-header app-name="Index Differ">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
        <div class="max-w-960 mx-auto">
            <div class="rounded border border-proton-grey-opacity-60 mt-24">
                <div class="flex bg-white p-8 bg-proton-grey-opacity-40 text-telluric-blue">
                    <div class="flex w-full">
                        <div class="flex">
                            <app-selector v-model="leftAppId" class="mb-4" />
                            <index-selector v-model="leftIndexName" :app-id="leftAppId" class="ml-12 mb-4" />
                        </div>
                        <div class="flex ml-auto">
                            <app-selector v-model="rightAppId" class="mb-4" />
                            <index-selector v-model="rightIndexName" :app-id="rightAppId" class="ml-12 mb-4" />
                        </div>
                    </div>
                </div>
                <div class="bg-white">
                    <diffs
                        :left-app-id="leftAppId"
                        :left-index-name="leftIndexName"
                        :right-app-id="rightAppId"
                        :right-index-name="rightIndexName"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppHeader from "common/components/header/AppHeader";
    import DisplayConfig from "@/index-differ/DisplayConfig";
    import AppManagement from "common/components/configuration/AppManagement";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import Diffs from "@/index-differ/Diffs";

    export default {
        name: 'IndexDiffer',
        components: {Diffs, DisplayConfig, AppHeader, AppManagement, AppSelector, IndexSelector},
        computed: {
            leftAppId: {
                get () {
                    return this.$store.state.panels.leftPanel.appId;
                },
                set (appId) {
                    this.$store.commit(`panels/leftPanel/setPanelConfig`, {appId: appId, indexName: null});
                }
            },
            leftIndexName: {
                get () {
                    return this.$store.state.panels.leftPanel.indexName;
                },
                set (indexName) {
                    this.$store.commit('panels/leftPanel/setPanelConfig', {appId: this.leftAppId, indexName: indexName});
                }
            },
            rightAppId: {
                get () {
                    return this.$store.state.panels.rightPanel.appId;
                },
                set (appId) {
                    this.$store.commit(`panels/rightPanel/setPanelConfig`, {appId: appId, indexName: null});
                }
            },
            rightIndexName: {
                get () {
                    return this.$store.state.panels.rightPanel.indexName;
                },
                set (indexName) {
                    this.$store.commit('panels/rightPanel/setPanelConfig', {appId: this.rightAppId, indexName: indexName});
                }
            },
        }
    }
</script>