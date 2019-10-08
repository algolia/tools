<template>
    <internal-app>
        <div class="flex h-screen">
            <div class="m-24 w-half flex flex-col min-h-0">
                <div class="bg-proton-grey-opacity-80 p-8 text-center">
                    Src Index
                </div>
                <app :client="client" />
            </div>
            <div class="m-24 w-half flex flex-col min-h-0">
                <div class="bg-proton-grey-opacity-80 p-8 text-center">
                    Actions
                </div>
                <actions :client="client" />
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import App from "@/index-manager/App";
    import Actions from "@/index-manager/Actions";
    import * as algoliasearch from "algoliasearch";

    export default {
        name: "IndexManager",
        components: {InternalApp, Actions, App},
        data: function () {
            return {
                appId: 'AJ0P3S7DWQ',
                apiKey: 'ce1181300d403d21311d5bca9ef1e6fb',
            };
        },
        computed: {
            client: function () {
                return algoliasearch(this.appId, this.apiKey);
            },
        }
    };
</script>
