<template>
    <internal-app>
        <app-header app-name="Index Manager">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
        <div class="flex" style="height: calc(100vh - 94px);">
            <div class="m-24 w-half flex flex-col min-h-0">
                <app-selector v-model="appId" />
                <app :client="client" />
            </div>
            <div class="m-24 w-half flex flex-col min-h-0">
                <actions :client="client" />
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import App from "@/index-manager/App";
    import AppHeader from "common/components/header/AppHeader";
    import DisplayConfig from "@/index-manager/DisplayConfig";
    import AppManagement from "common/components/configuration/AppManagement";
    import Actions from "@/index-manager/Actions";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import {getClient} from 'common/utils/algoliaHelpers';

    export default {
        name: "IndexManager",
        components: {InternalApp, Actions, App, AppHeader, DisplayConfig, AppManagement, AppSelector, IndexSelector},
        data: function () {
            return {
                client: null,
            }
        },
        created: async function () {
            if (this.appId) {
                this.client = await getClient(this.appId, this.adminAPIKey);
            }
        },
        computed: {
            appId: {
                get () {
                    return this.$store.state.indexmanager.appId;
                },
                async set (val) {
                    this.$store.commit('indexmanager/setAppId', val);
                    this.client = await getClient(this.appId, this.adminAPIKey);

                },
            },
            adminAPIKey: function () {
                if (!this.$store.state.apps[this.appId]) return null;
                return this.$store.state.apps[this.appId].key;
            },
        }
    };
</script>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Hind:400,600");
    @import "./src/assets/css/main";
</style>
