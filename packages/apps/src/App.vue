<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header>
                <display-config class="mx-16 mt-0 ml-auto"/>
            </app-header>
            <app-management />
            <div class="max-w-960 mx-auto mt-24" v-for="group in appsGroups">
                <h2 class="text-solstice-blue-opacity-80">{{group.name}}</h2>
                <p class="text-solstice-blue-opacity-80">{{group.description}}</p>
                <div class="flex flex-wrap">
                    <a v-for="app in group.apps" :href="app.url" target="_blank" class="my-24 mr-24">
                        <div
                            class="rounded border border-proton-grey-opacity-60 bg-white p-24 w-200 text-center text-lg shadow text-nova-grey"
                        >
                            {{app.name}}
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/DisplayConfig";

    export default {
        name: 'Home',
        components: {InternalApp, DisplayConfig, AppHeader, AppManagement},
        data: function () {
            return {
                appsGroups: [
                    {
                        name: 'Relevance tools',
                        description: 'Bootstrap, iterate, and fine tune relevance',
                        apps: [
                            {name: 'Metaparams', url: '/metaparams'},
                            {name: 'Relevance Testing', url: '/relevance-testing'},
                            {name: 'Index Differ', url: '/index-differ'},
                        ],
                    },
                    {
                        name: 'Management tools',
                        description: 'Manage your apps and indices',
                        apps: [
                            {name: 'Logs', url: '/logs'},
                        ]
                    },
                    {
                        name: 'Info tools',
                        description: 'Get information on engine features',
                        apps: [
                            {name: 'Dictionaries', url: '/dictionaries'},
                        ]
                    },
                ]
            };
        },
    }
</script>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Hind:400,600");
    @import "./src/assets/css/main";
</style>
