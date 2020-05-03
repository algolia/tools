<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Mercari">
                <display-config class="mx-16 mt-0 ml-auto"/>
            </app-header>
            <app-management />
            <template v-if="apps.length > 0" v-for="app in appsWithAdminKey">
                <template v-for="index in app.indices">
                    <index-loader
                        :app-id="app.application_id"
                        :index-name="index.name"
                        :config="config"
                        @onUpdateSettings="$set(appsState[$event.appId].indices[$event.indexName], 'settings', $event.settings)"
                        @onUpdateUsage="$set(appsState[$event.appId].indices[$event.indexName], 'usage', $event.usage)"
                    />
                </template>
            </template>
            <div class="flex m-24 pb-48">
                <config
                    class="mr-24"
                    :config="config"
                    @onUpdateUsagePeriod="$set(config.usage, 'period', $event)"
                    @onUpdateEnabledGraph="$set(config.usage, 'enabledGraphs', $event)"
                />
                <div v-if="apps.length > 0">
                    <h2 class="text-center mb-24">Infra overview: {{config.email}}</h2>
                    <div class="flex">
                        <div class="bg-white rounded border border-proton-grey-opacity-60">
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
                                        <div>{{app.nbClusters}} clusters</div>
                                        <div class="mb-12">{{app.nbDsns}} DSNs</div>
                                        <div v-for="cluster in app.clusters_and_replicas_names">{{cluster}}</div>
                                    </td>
                                </tr>
                                <tr class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top">Number of indices</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        <div v-if="app.indices !== undefined">{{Object.keys(app.indices).length}} {{Object.keys(app.indices).length > 1 ? 'indices': 'index'}}</div>
                                        <div v-else class="">unregistered</div>
                                    </td>
                                </tr>
                                <tr class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top">Total File size</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        <div v-if="app.fileSize">{{formatHumanNumber(app.fileSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</div>
                                        <div v-else class="">unregistered</div>
                                    </td>
                                </tr>
                                <tr v-for="conf in config.engineConfs" class="border-b border-proton-grey-opacity-40">
                                    <td class="p-8 align-top w-1    ">{{conf}}</td>
                                    <td v-for="app in apps" class="p-8 align-top">
                                        <span v-if="app.engine_configuration">
                                            {{JSON.stringify(app.engine_configuration[conf])}}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <indices v-for="app in appsWithAdminKey" :app="app" :config="config" class="mt-24" />
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
    import IndexLoader from "./IndexLoader";
    import Indices from "./Indices";
    import Config from "./Config";

    export default {
        name: 'App',
        components: {Config, Indices, IndexLoader, AppManagement, DisplayConfig, InternalApp, AppHeader},
        data: function () {
            return {
                appsState: {},
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
                    usage: {
                        period: 'month',
                        enabledGraphs: [],
                        metrics: ['records', 'avg_processing_time'],
                    },
                }
            };
        },
        created: async function () {
            this.getApps();
        },
        computed: {
            apps: function () {
                const appIds = Object.keys(this.appsState).sort((a, b) => this.appsState[a].name.localeCompare(this.appsState[b].name));
                return appIds.map((appId) => this.appsState[appId]);
            },
            appsWithAdminKey: function () {
                return this.apps.filter((app) => app.hasAdminKeyRegistered);
            }
        },
        methods: {
            adminAPIKey: function (appId) {
                if (this.$store.state.apps[appId]) return this.$store.state.apps[appId].key;
                return null;
            },
            getAppsDashboardInfo: async function () {
                const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${backendEnpoint}/apps/${Object.keys(this.appsState).join(',')}`, {
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
                const apps = {};
                res.hits.forEach((app) => {
                    if (!app.deleted && !ignoredAppIds.includes(app.application_id)) {
                        app.nbDsns = app.clusters_and_replicas_names.filter((c) => c.startsWith('t')).length;
                        app.nbClusters = app.clusters_and_replicas_names.filter((c) => c.startsWith('d')).length;
                        app.apiKey = this.adminAPIKey(app.application_id);
                        app.hasAdminKeyRegistered = !!app.apiKey;
                        apps[app.application_id] = app;
                    }
                })

                this.appsState = apps;

                this.getAppsDashboardInfo().then((appsInfo) => {
                    appsInfo.forEach((appInfo) => {
                        this.$set(this.appsState[appInfo.application_id], 'engine_configuration', appInfo.current_plan.engine_configuration);
                    });
                });

                for (let appId in this.appsState) {
                    if (this.appsState[appId].apiKey) {
                        const appClient = algoliasearch(this.appsState[appId].application_id, this.appsState[appId].apiKey);
                        appClient.listIndices().then((indices) => {
                            let fileSize = 0;
                            const indicesObj = {};
                            indices.items.forEach((index) => {
                                fileSize += index.fileSize;
                                indicesObj[index.name] = index;
                            });
                            this.$set(this.appsState[appId], 'indices', indicesObj);
                            this.$set(this.appsState[appId], 'fileSize', fileSize);
                        });
                    }
                }
            }
        }
    }
</script>
