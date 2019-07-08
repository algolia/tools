<template>
    <div class="overflow-hidden flex flex-col" v-if="!loadingSharingLink">
        <app-header />
        <share-view v-if="$store.state.panels.shareStatePanel" />
        <app-management v-if="$store.state.panels.manageAppsPanel" />
        <div class="w-full">
            <search-box
                class="mt-16 mx-16 lg:mx-auto xl:mx-auto lg:max-w-half xl:max-w-half"
                v-if="$store.state.panels.splitMode && !$store.state.panels.twoInputs && Object.keys($store.state.apps).length > 0"
            />
        </div>
        <div
            v-if="Object.keys($store.state.apps).length"
            class="w-full flex flex-1 items-start"
        >
            <div class="min-w-0 flex-1">
                <dashboard panel-key="leftPanel" />
            </div>
            <div v-if="$store.state.panels.comparePanels" class="min-w-240 max-w-240 flex-1">
                <compare-hits
                    class="m-8 mr-8"
                />
            </div>
            <div class="min-w-0 flex-1" v-if="$store.state.panels.splitMode || !$store.state.panels.expandLeftPanel">
                <dashboard
                    v-if="$store.state.panels.splitMode"
                    panel-key="rightPanel"
                />
                <div v-else class="flex justify-center h-full text-solstice-blue-opacity-60">
                    <div class="max-w-600 px-auto mt-156 leading-normal">
                        <div>
                            <p>
                                Click on Split Mode
                                <split-icon class="w-auto h-16 fill-current"/>
                                to open a second explorer.
                            </p>
                            <p>In split mode:</p>
                            <ul>
                                <li>if you have the same index on both explorer you are able to compare search params effect</li>
                                <li>if you have two differents indices you are able to compare the impact of change to search params and index settings</li>
                            </ul>
                        </div>

                        <div class="mt-32">
                            Click on Compare Hits
                            <compare-icon
                                class="w-auto h-16 fill-current"
                            />
                            to visualize the diff between the two explorers. It is also useful to track specific objectIDs over several queries.
                        </div>

                        <div class="mt-32">
                            <p>
                                The ranking of a query can be visualized globally by switching the Charts
                                <bar-chart-icon class="w-auto h-16 stroke-current mr-4" /> view.
                            </p>
                            <p>This is useful for:</p>
                            <ul>
                                <li>identify weird pattern on any of the ranking criteria</li>
                                <li>checking where the ties are broken</li>
                                <li>ensure that the custom ranking is well defined</li>
                                <li>and things we didn't imagine yet</li>
                            </ul>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Dashboard from "@/dashboard/Dashboard";
    import AppHeader from "@/AppHeader";
    import CompareHits from "@/explorer/compare/CompareHits";

    import SplitIcon from "common/icons/split.svg";
    import CompareIcon from "common/icons/compare.svg";
    import BarChartIcon from 'common/icons/bar-chart.svg'
    import AppManagement from "@/dashboard/AppManagement";
    import ShareView from "@/dashboard/ShareView";
    import SearchBox from "@/dashboard/SearchBox";

    export default {
        name: "AppLoggedIn",
        components: {
            SearchBox,
            ShareView, AppManagement, CompareHits, AppHeader, Dashboard, SplitIcon, CompareIcon, BarChartIcon},
        data: function () {
            return {
                loadingSharingLink: true,
            }
        },
        created: async function () {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");

            if (code) {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/state/get/${code}`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (res.ok) {
                    const link = await res.json();
                    const state = JSON.parse(link.value);

                    this.$store.commit('panels/replacePanels', state.panels);

                    let appId, indexName;
                    for (appId in state.apps) {
                        this.$store.commit("apps/addAppId", {appId: appId});
                        if (state.apps[appId].lastIndexName) {
                            this.$store.commit(`apps/${appId}/setLastIndexName`, state.apps[appId].lastIndexName);
                        }

                        for (indexName in state.apps[appId]) {
                            if (indexName === 'lastIndexName') {
                                continue;
                            }

                            this.$store.commit(`apps/${appId}/addIndex`, indexName);
                            this.$store.commit(`apps/${appId}/${indexName}/replaceIndexData`, state.apps[appId][indexName]);
                        }
                    }
                }

                window.history.replaceState({}, document.title, '/');
            }
            this.loadingSharingLink = false;
        }
    };
</script>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Hind:400,600");
    @import "./src/assets/css/main";
</style>
