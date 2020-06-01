<template>
    <internal-app>
        <div class="overflow-hidden flex flex-col">
            <app-header app-name="Metaparams">
                <display-config class="mx-16 mt-0"/>
            </app-header>
            <share-view
                v-if="!loadingSharingLink && $store.state.panels.shareStatePanel"
                @onShouldClose="$store.commit('panels/setShareStatePanel', false)"
            />
            <app-management @onAddedAppId="$store.commit(`panels/leftPanel/setPanelConfig`, {appId: $event, indexName: null})" />
            <div class="w-full" v-if="!loadingSharingLink">
                <search-box
                    class="mt-16 mx-16 lg:mx-auto xl:mx-auto lg:max-w-half xl:max-w-half"
                    v-if="$store.state.panels.splitMode && !$store.state.panels.twoInputs && Object.keys($store.state.apps).length > 0"
                    panel-key="leftPanel"
                />
            </div>
            <div
                v-if="!loadingSharingLink && Object.keys($store.state.apps).length"
                class="w-full flex flex-1 items-start"
            >
                <div class="min-w-0 flex-1">
                    <dashboard panel-key="leftPanel" />
                </div>
                <div v-show="$store.state.panels.comparePanels" class="min-w-240 max-w-240 flex-1">
                    <compare-hits
                        class="m-8 mr-8"
                        :enabled="$store.state.panels.comparePanels"
                        @onGoToHit="onGoToHit"
                    />
                </div>
                <div
                    :class="$store.state.panels.splitMode ? 'min-w-0 flex-1' : 'min-w-0'"
                    v-if="$store.state.panels.splitMode || !$store.state.panels.expandLeftPanel"
                >
                    <dashboard
                        v-if="$store.state.panels.splitMode"
                        panel-key="rightPanel"
                    />
                    <div v-else class="flex justify-center h-full text-solstice-blue-opacity-60">
                        <div class="max-w-300 mx-48 px-auto mt-156 leading-normal">
                            <div>
                                <p>
                                    Click on Split Mode
                                    <split-icon class="w-auto h-16 fill-current"/>
                                    to open a second explorer.
                                </p>
                                <p>In split mode:</p>
                                <ul>
                                    <li class="ml-8">- if you have the same index on both explorer you are able to compare search params effect</li>
                                    <li class="ml-8">- if you have two differents indices you are able to compare the impact of change to search params and index settings</li>
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
                                    <li class="ml-8">- identify weird pattern on any of the ranking criteria</li>
                                    <li class="ml-8">- checking where the ties are broken</li>
                                    <li class="ml-8">- ensure that the custom ranking is well defined</li>
                                    <li class="ml-8">- and things we didn't imagine yet</li>
                                </ul>

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
    import Dashboard from "@/dashboard/Dashboard";
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/dashboard/DisplayConfig";
    import CompareHits from "common/components/compare/CompareHits";

    import SplitIcon from "common/icons/split.svg";
    import CompareIcon from "common/icons/compare.svg";
    import BarChartIcon from 'common/icons/bar-chart.svg'
    import ShareView from "@/dashboard/ShareView";
    import SearchBox from "@/dashboard/SearchBox";

    import {goToAnchor} from "common/utils/domHelpers";

    export default {
        name: "AppLoggedIn",
        components: {
            InternalApp, SearchBox, DisplayConfig,
            ShareView, CompareHits, AppHeader, Dashboard, SplitIcon, CompareIcon, BarChartIcon, AppManagement},
        data: function () {
            return {
                loadingSharingLink: true,
            }
        },
        created: async function () {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");

            if (code) {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${endpoint}/state/get/${code}`, {
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
                        this.$store.commit("apps/addAppId", appId);
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
                    this.$root.$emit('onFetchAppsInfo');
                }

                window.history.replaceState({}, document.title, '/metaparams');
            }
            this.loadingSharingLink = false;
        },
        methods: {
            onGoToHit: function (i, panelKey) {
                const otherPanelKey = panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
                const appId = this.$store.state.panels[panelKey].appId;
                const indexName = this.$store.state.panels[panelKey].indexName;
                const otherAppId = this.$store.state.panels[otherPanelKey].appId;
                const otherIndexName = this.$store.state.panels[otherPanelKey].indexName;
                const isSameIndexOnBothPanels = appId === otherAppId && indexName === otherIndexName;
                const searchConfigKey = isSameIndexOnBothPanels && panelKey === 'rightPanel' ? 'searchParams2' : 'searchParams';
                const searchParamsRaw = this.$store.state.apps[appId][indexName][searchConfigKey];
                const hitsPerPage = searchParamsRaw.hitsPerPage && searchParamsRaw.hitsPerPage.enabled ? searchParamsRaw.hitsPerPage.value : 8;
                const page = searchParamsRaw.page && searchParamsRaw.page.enabled ? searchParamsRaw.page.value : 0;
                const pageSize = hitsPerPage || 1;
                const goToPage = Math.floor((i - 1) / pageSize);
                const anchor = `#${panelKey}-${i}`;

                if (page !== goToPage) {
                    this.$store.commit(`apps/${appId}/${indexName}/setParamValue`, {configKey: searchConfigKey, key: 'page', value: goToPage});
                    this.$root.$emit('wantsToGoToAnchorAtNext', anchor);
                } else {
                    this.$nextTick(() => {
                        goToAnchor(anchor);
                    });
                }
            },
        }
    };
</script>
