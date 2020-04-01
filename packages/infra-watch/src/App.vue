<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Infra Watch" />
            <div class="max-w-960 mx-auto mt-24">
                <div class="bg-white rounded border border-proton-grey-opacity-60">
                    <div
                        class="flex border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue"
                    >
                        <!--<div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'inspect' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'inspect'"
                        >
                            Inspect
                        </div>-->
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'mlocks' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'mlocks'"
                        >
                            Mlocks alerts
                        </div>
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'busted' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'busted'"
                        >
                            Busted
                        </div>
                    </div>
                    <div class="p-24">
                        <!--<inspect v-if="currentTab === 'inspect'" />-->
                        <mlocks v-if="currentTab === 'mlocks'" :failing="failing" :recovered="recovered" />
                        <busted v-if="currentTab === 'busted'" />
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import {getKey} from "common/components/selectors/getClusterList";
    import algoliasearch from "algoliasearch";
    import Mlocks from "./Mlocks";
    import Busted from "./Busted";
    import Inspect from "./Inspect";

    export default {
        name: 'Home',
        components: {Inspect, Busted, Mlocks, InternalApp, AppHeader},
        data: function () {
            return {
                failing: [],
                recovered: [],
                currentTab: 'mlocks'
            };
        },
        created: async function () {
            const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
            const res = await fetch(`${backendEnpoint}/mlock-alerts/last`, {
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const json = await res.json();

            const key = await getKey();
            const client = algoliasearch('X20GSLY1CL', key);
            const index = client.initIndex('applications_production');

            this.failing = await this.extractClusters(json.failingSeries, index);
            this.recovered = await this.extractClusters(json.recoveredSeries, index);
        },
        methods: {
            isCluster: function (clusterName) {
                return clusterName.startsWith('v') || clusterName.startsWith('d');
            },
            isDsn: function (clusterName) {
                return clusterName.startsWith('t');
            },
            extractClusters: async function (series, index) {
                const clusters = series.map((x) => {
                    return x[2][0].split('=')[1];
                }).filter((clusterName) => {
                    return this.isCluster(clusterName) || this.isDsn(clusterName);
                });

                const newClusters = {};

                const promises = clusters.map(async (clusterName) => {
                    const res = await index.search('', {
                        'filters': `clusters_and_replicas_names:${clusterName}`,
                        'hitsPerPage': 50,
                    });

                    res.hits.forEach((hit) => {
                        const mainCluster = hit.cluster_name;

                        if (newClusters[mainCluster] === undefined) {
                            newClusters[mainCluster] = {
                                allMachines: hit.clusters_and_replicas_names,
                                clusters: hit.clusters_and_replicas_names.filter((m) => this.isCluster(m)),
                                dsns: hit.clusters_and_replicas_names.filter((m) => this.isDsn(m)),
                                failingMachines: [],
                                users: {},
                            };
                        }

                        if (newClusters[mainCluster].failingMachines.includes(clusterName) === false) {
                            newClusters[mainCluster].failingMachines.push(clusterName);
                        }

                        if (newClusters[mainCluster].users[hit.user_email] === undefined) {
                            newClusters[mainCluster].users[hit.user_email] = {
                                apps: [],
                                company: hit.user_company,
                                email: hit.user_email,
                            };
                        }

                        const foundApp = newClusters[mainCluster].users[hit.user_email].apps.findIndex((e) => {
                            return hit.application_id === e.appId;
                        }) !== -1;

                        if (!foundApp) {
                            newClusters[mainCluster].users[hit.user_email].apps.push({
                                appId: hit.application_id,
                                appName: hit.name || '',
                                adminUrl: `https://admin.algolia.com/admin/users/${hit.user_id}/applications/${hit.application_id}`,
                            });
                        }
                    });
                });

                await Promise.all(promises);

                return newClusters;
            }
        }
    }
</script>
