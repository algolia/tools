<template>
    <div class="mr-12 bg-white rounded border border-proton-grey-opacity-80">
        <div class="p-8 border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
            Load existing customer data
        </div>
        <div class="m-16">
            <div class="flex items-center px-16 bg-white rounded border border-proton-grey-opacity-80 h-40">
                <input
                    class="flex-1 block h-full bg-transparent text-telluric-blue leading-normal"
                    placeholder="Search customer name, appId, server"
                    ref="search"
                    @focus="appsRes === null ? triggerAppSearch() : ''"
                    v-model="query"
                >
            </div>

            <div v-if="appsRes" class="mt-12">
                <table class="w-full">
                    <tr
                        v-for="app in appsRes"
                        class="border-b border-proton-grey-opacity-40"
                    >
                        <td class="p-8">
                            <div>{{app.appId}}</div>
                            <div>{{app.appName}}</div>
                            <div>{{app.appUserEmail}}</div>
                        </td>
                        <td class="p-8">
                            <div>{{app.nbClusters}} dedicated clusters</div>
                            <div>{{app.nbDsns}} DSNs</div>
                        </td>
                        <td class="p-8">
                            {{app.scoping}}
                        </td>
                        <td class="p-8">
                            <button
                                class="mx-auto bg-white border border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            >
                                Add to current scoping
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    import {getKey} from "common/components/selectors/getClusterList";
    import algoliasearch from "algoliasearch";

    export default {
        name: 'Load',
        data: function () {
            return {
                appIndex: null,
                appsRes: null,
                query: '',
                apps: [],
            };
        },
        created: async function () {
            const key = await getKey();
            const client = algoliasearch('X20GSLY1CL', key);
            this.appIndex = client.initIndex('applications_production');
        },
        watch: {
            query: function () {
                this.triggerAppSearch();
            }
        },
        methods: {
            triggerAppSearch: async function () {
                if (this.query.length <= 0) {
                    this.appsRes = null;
                    return;
                }

                const res = await this.appIndex.search(this.query, {
                    filters: 'deleted:false',
                    disableTypoToleranceOnAttributes: ['clusters_and_replicas_names'],
                    allowTyposOnNumericTokens: false,
                    typoTolerance: 'min',
                });

                const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res2 = await fetch(`${backendEnpoint}/apps/${res.hits.map((app) => app.application_id).join(',')}`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const extraInfo = await res2.json();

                const apps = res.hits.map((app, i) => {
                    const selectedAddons = [];
                    if (Number.isInteger(extraInfo[i].current_plan.analytics_retention_days) && extraInfo[i].current_plan.analytics_retention_days > 90) {
                        selectedAddons.push('analytics_ret');
                    }
                    if (extraInfo[i].current_plan.crawler) selectedAddons.push('crawler');

                    const nbDsns = app.clusters_and_replicas_names.filter((c) => c.startsWith('c') || c.startsWith('b') || c.startsWith('s') || c.startsWith('t')).length;
                    const nbClusters = app.clusters_and_replicas_names.filter((c) => c.startsWith('d') || c.startsWith('v') || c.startsWith('a')).length;

                    return {
                        selected: true,
                        scoping: {
                            nbSearchRequests: 0,
                            nbRecords: 0,
                            hasPremium: extraInfo[i].current_plan.included_rules > 10 || extraInfo[i].current_plan.personalization,
                            enterprisePackage: extraInfo[i].user.premium_support || false,
                            nbDsn: nbDsns,
                            nbDedicatedCluster: nbClusters,
                            discount: 0,
                            selectedAddons: selectedAddons,
                            selectedPackages: [],
                        },
                        appId: app.application_id,
                        appName: app.name,
                        appUserEmail: app.user_email,
                        nbDsns: nbDsns,
                        nbClusters: nbClusters,
                    }
                });

                this.appsRes = apps;
            },
        }
    }
</script>
