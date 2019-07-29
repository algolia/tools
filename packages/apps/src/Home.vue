<template>
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
</template>

<script>
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/DisplayConfig";

    import RefreshCw from 'common/icons/refresh-cw.svg';

    export default {
        name: 'Home',
        components: {DisplayConfig, AppHeader, AppManagement, RefreshCw},
        data: function () {
            return {
                appsGroups: [
                    {
                        name: 'Ready',
                        description: 'Feature complete. Used by several people on real use case already.',
                        apps: [
                            {name: 'Metaparams', url: '/metaparams'},
                        ],
                    },
                    {
                        name: 'Beta',
                        description: 'Ready in terms of feature set. Not enough people tried it yet to consider it ready',
                        apps: [
                            {name: 'Logs', url: '/logs'},
                        ],
                    },
                    {
                        name: 'In development',
                        description: 'No guaranty. Make sure you are not using these with customer data',
                        apps: [
                            {name: 'Index Manager', url: '/index-manager'},
                            {name: 'Perso formula', url: '/perso-formula'},
                        ],
                    }
                ]
            };
        },
    }
</script>