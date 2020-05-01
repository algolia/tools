<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Mercari">
                <display-config class="mx-16 mt-0 ml-auto"/>
            </app-header>
            <app-management />
            <div class="mx-24">
                <div class="mx-auto m-24 pb-48" v-if="apps.length > 0">
                    <h2 class="text-center mb-24">Infra overview: {{config.email}}</h2>
                    <div class="flex">
                        <div class="bg-white rounded border border-proton-grey-opacity-60 mx-auto">
                            <table>
                                <tr class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top">appId</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        {{app.application_id}}
                                    </td>
                                </tr>
                                <tr class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top">appName</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        {{app.name}}
                                    </td>
                                </tr>
                                <tr class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top">Infra</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        <div v-for="cluster in app.clusters_and_replicas_names">{{cluster}}</div>
                                    </td>
                                </tr>
                                <tr class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top">nbIndices</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        <div v-if="app.hasAdminKeyRegistered">
                                            {{app.indices.length}}
                                            {{app.indices.length > 1 ? 'indices': 'index'}}
                                            -
                                            {{formatHumanNumber(app.indices.map((index) => index.fileSize).reduce((a,b) => a + b, 0), 0, ['B', 'KB', 'MB', 'GB'], 1000)}}
                                        </div>
                                        <div v-else class="">unregistered appID</div>
                                    </td>
                                </tr>
                                <tr v-for="conf in config.engineConfs" class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top w-1    ">{{conf}}</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        {{JSON.stringify(app.engine_configuration[conf])}}
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div v-for="app in appsWithAdminKey" class="mt-24">
                        <h2 class="text-center mb-24">Indices: {{app.application_id}} - {{app.name}}</h2>
                        <div class="flex">
                            <div class="bg-white rounded border border-proton-grey-opacity-60 mx-auto">
                                <table>
                                    <tr class="border-b border-proton-grey-opacity-40">
                                        <td class="p-8 align-top">Name</td>
                                        <td class="p-8 align-top">nbRecords</td>
                                        <td class="p-8 align-top">dataSize</td>
                                        <td class="p-8 align-top">fileSize</td>
                                        <td class="p-8 align-top">nbShards</td>
                                    </tr>
                                    <tr class="border-b border-proton-grey-opacity-40" v-for="index in app.indices">
                                        <td class="p-8 align-top">{{index.name}}</td>
                                        <td class="p-8 align-top">{{formatHumanNumber(index.entries)}}</td>
                                        <td class="p-8 align-top">{{formatHumanNumber(index.dataSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                                        <td class="p-8 align-top">{{formatHumanNumber(index.fileSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                                        <td class="p-8 align-top">{{index.nbShards}}</td>
                                    </tr>
                                </table>
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

    import {getKey} from "common/components/selectors/getClusterList";
    import algoliasearch from 'algoliasearch';
    import {formatHumanNumber} from "common/utils/formatters";

    export default {
        name: 'Home',
        components: {AppManagement, DisplayConfig, InternalApp, AppHeader},
        data: function () {
            return {
                apps: [],
                formatHumanNumber,
                config: {
                    email: 'etdev@mercari.com',
                    ignoreAppIds: ['6102AREHZ4'],
                    engineConfs: [
                        'nb_dedicated_indexing_threads',
                        'max_nb_indexing_thread',
                        'max_nb_query_threads',
                        'query_timeout_ms',
                        'degraded_query_timeout',
                        'not_enough_hits_query_timeout_ms',
                        'max_nb_hits_for_not_enough_hits_timeout',
                        'force_mlock_after_build',
                        'force_merge_at_gmt',
                        'max_small_gen_size_mb',
                        'min_big_gen_size_mb',
                        'mlock',
                    ],
                }
            };
        },
        created: async function () {
            this.getApps();
        },
        computed: {
            appsWithAdminKey: function () {
                return this.apps.filter((app) => app.hasAdminKeyRegistered);
            }
        },
        methods: {
            adminAPIKey: function (appId) {
                if (this.$store.state.apps[appId]) return this.$store.state.apps[appId].key;
                return null;
            },
            getAppsDashboardInfo: async function (apps) {
                const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${backendEnpoint}/apps/${apps.map((app) => app.application_id).join(',')}`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                return await res.json();
            },
            getApps: async function () {
                const key = await getKey();
                const client = algoliasearch('X20GSLY1CL', key);
                const index = client.initIndex('applications_production');

                const res = await index.search('', {
                    facetFilters: [`user_email:${this.config.email}`],
                })

                const ignoredAppIds = this.config.ignoreAppIds || [];
                const apps = res.hits.filter((app) => {
                    return !app.deleted && !ignoredAppIds.includes(app.application_id);
                }).sort((a, b) => a.name.localeCompare(b.name));

                const dashboardInfo = await this.getAppsDashboardInfo(apps);

                for (let i = 0; i < apps.length; i++) {
                    apps[i].engine_configuration = dashboardInfo[i].current_plan.engine_configuration;
                    const apiKey = this.adminAPIKey(apps[i].application_id);
                    apps[i].hasAdminKeyRegistered = !!apiKey;
                    if (apiKey) {
                        const appClient = algoliasearch(apps[i].application_id, apiKey);
                        const indices = await appClient.listIndices();
                        apps[i].indices = indices.items.sort((a, b) => b.fileSize - a.fileSize);
                        apps[i].indices.map(async (index, indexPos) => {
                            const algoliaIndex = appClient.initIndex(index.name);
                            const settings = await algoliaIndex.getSettings({queryParameters: {advanced: 1}});
                            this.$set(apps[i].indices[indexPos], 'nbShards', settings.nbShardsAuto > 1 ? settings.nbShardsAuto : (settings.nbShards || 1));
                        });
                    }
                }


                this.apps = apps;
            }
        }
    }
</script>
