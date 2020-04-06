<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Infra Watch" />
            <div class="max-w-960 mx-auto mt-24 pb-48">
                <div class="bg-white rounded border border-proton-grey-opacity-60">
                    <div
                        class="flex border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue"
                    >
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'inspect' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'inspect'"
                        >
                            Inspect
                        </div>
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'mlocks' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'mlocks'"
                        >
                            Mlocks alerts <span v-if="Object.keys(failing).length > 1">({{Object.keys(failing).length - 1}})</span>
                        </div>
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'busted' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'busted'"
                        >
                            Busted <span v-if="busted.length > 0">({{busted.length}})</span>
                        </div>
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'wrongPlans' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'wrongPlans'"
                        >
                            Wrong plans <span v-if="wrongPlans.length > 0">({{wrongPlans.length}})</span>
                        </div>
                    </div>
                    <div class="p-24">
                        <inspect v-if="currentTab === 'inspect'" />
                        <mlocks v-if="currentTab === 'mlocks'" :failing="failing" :recovered="recovered" />
                        <app-list v-if="currentTab === 'busted'" :list="busted" />
                        <app-list v-if="currentTab === 'wrongPlans'" :list="wrongPlans" />
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import Mlocks from "./Mlocks";
    import AppList from "./AppList";
    import Inspect from "./Inspect";
    import {getMlockData} from "./helpers";
    import {getKey} from "common/components/selectors/getClusterList";
    import algoliasearch from "algoliasearch";

    export default {
        name: 'Home',
        components: {Inspect, AppList, Mlocks, InternalApp, AppHeader},
        data: function () {
            return {
                failing: {},
                recovered: {},
                currentTab: 'inspect',
                busted: [],
                wrongPlans: [],
            };
        },
        created: async function () {
            getMlockData().then((mlockData) => {
                this.failing = mlockData.failing;
                this.recovered = mlockData.recovered;
            });
            this.browseApp();
        },
        methods: {
            getAppObject: function (application, cluster) {
                return {
                    name: application.user_full_name,
                    email: application.user_email,
                    appId: application.application_id,
                    appName: application.name,
                    planName: application.plan_name,
                    cluster: cluster,
                    adminUrl: `https://admin.algolia.com/admin/users/${application.user_id}/applications/${application.application_id}`,
                }
            },
            browseApp: async function () {
                const key = await getKey();
                const client = algoliasearch('X20GSLY1CL', key);
                const index = client.initIndex('applications_production');

                const enterprisePlans = ['business', 'business_light', 'enterprise'];

                await index.browseObjects({
                    batch: (applications) => {
                        applications.forEach((application) => {
                            let addedBusted = false;
                            let addedWrongPlan = false;
                            if (application.deleted !== true) {
                                return;
                            }

                            for (let i = 0; i < application.clusters_and_replicas_names.length; i++) {
                                const cluster = application.clusters_and_replicas_names[i];

                                if (cluster.startsWith('d') || cluster.startsWith('v') || cluster.startsWith('a')) {
                                    if (enterprisePlans.includes(application.plan_name) === false) {
                                        if (!addedWrongPlan) {
                                            this.wrongPlans.push(this.getAppObject(application, cluster));
                                        }
                                        addedWrongPlan = true;
                                    }
                                    if (application.user_email.endsWith('@algolia.com')) {
                                        if (!addedBusted) {
                                            this.busted.push(this.getAppObject(application, cluster));
                                            this.busted.sort((a, b) => {
                                                if (a.name && b.name && a.name !== b.name) return a.name.localeCompare(b.name);
                                                return a.cluster.localeCompare(b.cluster);
                                            });
                                        }
                                        addedBusted = true;
                                        break;
                                    }
                                } else if (cluster.startsWith('c') || cluster.startsWith('b') || cluster.startsWith('w')) {
                                    if (enterprisePlans.includes(application.plan_name)) {
                                        if (!addedWrongPlan) {
                                            this.wrongPlans.push(this.getAppObject(application, cluster));
                                        }
                                        addedWrongPlan = true;
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }
    }
</script>
