<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Mlock Alerts" />
            <div class="max-w-960 mx-auto mt-24">
                <div class="bg-white rounded border border-proton-grey-opacity-60 px-24">
                    <template v-if="!isEmpty">
                        <failing-group :group="failing" group-name="Failing"/>
                        <failing-group :group="newlyFailing" group-name="New Failing"/>
                        <failing-group :group="recovered" group-name="Recovered"/>
                    </template>
                    <div v-else class="p-8 text-center text-cosmos-black-opacity-70">
                        No problem
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
    import FailingGroup from "./FailingGroup";

    export default {
        name: 'Home',
        components: {FailingGroup, InternalApp, AppHeader},
        data: function () {
            return {
                failing: [],
                newlyFailing: [],
                recovered: [],
            };
        },
        created: async function () {
            const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://algolia-apps-backend.herokuapp.com';
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
            this.newlyFailing = await this.extractClusters(json.newlyFailingSeries, index);
            this.recovered = await this.extractClusters(json.recoveredSeries, index);
        },
        computed: {
            isEmpty: function () {
                return this.failing.length === 0 && this.newlyFailing.length === 0 && this.recovered.length === 0;
            }
        },
        methods: {
            extractClusters: async function (series, index) {
                const clusters = series.map((x) => {
                    return x[2][0].split('=')[1];
                });

                const promises = clusters.filter((clusterName) => {
                    return clusterName.startsWith('v') || clusterName.startsWith('d') || clusterName.startsWith('t');
                }).map(async (clusterName) => {
                    const res = await index.search('', {
                        'filters': `clusters_and_replicas_names:${clusterName}`,
                        'hitsPerPage': 50,
                    });

                    return {
                        clusters: [clusterName],
                        apps: res.hits.map((hit) => {
                            return {
                                appId: hit.application_id,
                                company: hit.user_company,
                                email: hit.user_email,
                                clusters: hit.clusters_and_replicas_names,
                                adminUrl: `https://admin.algolia.com/admin/users/${hit.user_id}/applications/${hit.application_id}`,
                            };
                        })
                    };
                });

                const clustersReformated = await Promise.all(promises);

                const alreadySeenClusters = {};

                return clustersReformated.filter((c) => {
                    const keep = alreadySeenClusters[c.clusters[0]] === undefined;
                    c.apps.forEach((app) => {
                        app.clusters.forEach((appCluster) => {
                            if (alreadySeenClusters[appCluster] === undefined) {
                                alreadySeenClusters[appCluster] = c;
                            }
                        });
                    });

                    if (!keep) {
                        alreadySeenClusters[c.clusters[0]].clusters.push(c.clusters[0]);
                    }

                    return keep;
                });
            }
        }
    }
</script>
