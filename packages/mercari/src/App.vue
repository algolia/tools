<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Mercari">
                <display-config class="mt-0 ml-auto"/>
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
                    @onUpdateDetailPerIndex="$set(config.usage, 'detailsPerIndex', $event)"
                    @onUpdateUserEmail="$set(config, 'email', $event)"
                />
                <div v-if="apps.length > 0" class="flex-grow">
                    <div class="bg-white rounded border border-proton-grey-opacity-60">
                        <panel-tabs
                            v-model="currentTab"
                            :options="[
                                {value: 'overview', label: 'Infra overview'},
                                {value: 'indices', label: 'Indices'},
                            ]"
                        />
                        <div>
                            <infra-overview v-if="currentTab === 'overview'" :apps="apps" :config="config" />
                            <indices v-if="currentTab === 'overview'" v-for="app in appsWithAdminKey" :app="app" :config="config" class="mt-24" />
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
    import PanelTabs from "common/components/tabs/PanelTabs";
    import DisplayConfig from "./DisplayConfig";

    import {getKey} from "common/components/selectors/getClusterList";
    import algoliasearch from 'algoliasearch';
    import {formatHumanNumber} from "common/utils/formatters";
    import IndexLoader from "./IndexLoader";
    import Indices from "./Indices";
    import Config from "./Config";
    import InfraOverview from "./InfraOverview";

    export default {
        name: 'App',
        components: {
            InfraOverview,
            PanelTabs, Config, Indices, IndexLoader, AppManagement, DisplayConfig, InternalApp, AppHeader},
        data: function () {
            return {
                currentTab: 'overview',
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
                        detailsPerIndex: false,
                        enabledGraphs: [],
                        metrics: ['records', 'avg_processing_time'],
                    },
                }
            };
        },
        created: async function () {
            this.getApps();
        },
        watch: {
            'config.email': function () {
                this.appsState = {};
                this.getApps();
            }
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
