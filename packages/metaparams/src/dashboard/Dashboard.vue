<template>
    <div class="m-16" :class="panelKey === 'leftPanel' ? 'mr-8' : 'ml-8'">
        <search-box
            v-if="!$store.state.panels.splitMode || $store.state.panels.twoInputs"
            :panel-key="panelKey"
        />
        <div class="mt-16 rounded bg-white border border-solid border-proton-grey-opacity-60">
            <div class="px-8 py-8 pb-12 bg-proton-grey-opacity-80 border-b border-nova-grey-opacity-20">
                <div class="flex flex-wrap justify-start items-center">
                    <app-selector v-model="appId" class="mb-12" />
                    <index-selector v-model="indexName" :app-id="appId" class="ml-12 mb-12" />
                    <index-new class="mb-12 pb-4" :panel-key="panelKey" />
                    <index-delete v-if="!isReadOnly" class="mb-12 pb-4" :panel-key="panelKey" />
                    <button v-if="$store.state.panels.splitMode && !sameIndexOnEachPanel && panelKey === 'leftPanel'"
                            @click="$store.commit('panels/rightFromLeft')"
                            class="block ml-8 mb-12 relative group"
                    >
                        <flip-right-icon class="block w-16 h-16 text-solstice-blue fill-current"/>
                        <tooltip>Open this index in the right panel</tooltip>
                    </button>
                    <button v-if="$store.state.panels.splitMode && !sameIndexOnEachPanel && panelKey === 'rightPanel'"
                            @click="$store.commit('panels/leftFromRight')"
                            class="block ml-8 mb-12 relative group"
                    >
                        <flip-left-icon class="block w-16 h-16 text-solstice-blue fill-current"/>
                        <tooltip>Open this index in the left panel</tooltip>
                    </button>
                    <custom-select
                        v-model="panelServer"
                        :options="['dsn', '1', '2', '3']"
                        class="mb-12 ml-auto text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
                    >
                        <template slot="icon">
                            <server-icon class="block -mt-1 mr-8 w-12 h-12"/>
                        </template>
                        <template v-slot:default="{option}">-{{option}}</template>
                    </custom-select>
                    <button v-if="!$store.state.panels.splitMode && panelKey === 'leftPanel'"
                            @click="$store.commit('panels/setExpandLeftPanel', !$store.state.panels.expandLeftPanel)"
                            class="mb-12 block px-8 ml-8 py-4 border border-telluric-blue-opacity-60 rounded relative group"
                    >
                        <maximize-icon v-if="!$store.state.panels.expandLeftPanel"
                                       class="block w-16 h-16 text-cosmos-black-opacity-70 fill-current"/>
                        <minimize-icon v-if="$store.state.panels.expandLeftPanel"
                                       class="block w-16 h-16 text-cosmos-black-opacity-70 fill-current"/>
                        <tooltip>{{$store.state.panels.expandLeftPanel ? 'Shrink the panel' : 'Expand the panel'}}</tooltip>
                    </button>
                </div>
                <index-info v-if="indexData" :panel-key="panelKey"/>
            </div>
            <div v-if="indexData">
                <div class="flex">
                    <div v-if="panelKey === 'leftPanel'" class="w-300 max-w-300 min-w-300">
                        <queries :panel-key="panelKey"/>
                        <dashboard-config :panel-key="panelKey"/>
                    </div>
                    <div
                        style="width: calc(100% - 300px)"
                        :class="`${panelKey === 'leftPanel' ? 'border-l': 'border-r'} border-proton-grey `"
                        class="flex"
                    >
                        <explorer
                            v-if="panelIndexName"
                            :panel-key="panelKey"
                            class="bg-white flex-1 min-w-0"
                        />
                        <facets
                            v-show="!$store.state.panels.splitMode"
                            class="xxl:min-w-260 xxl:max-w-260 min-w-152 max-w-152 border-l border-proton-grey"
                            :panel-key="panelKey"
                            :app-id="panelAppId"
                            :index-name="panelIndexName"
                            :search-params="searchParams"
                            :query="searchParams.query !== undefined ? searchParams.query : $store.state.panels.query"
                            :index-settings="refIndexSettings"
                            :config-key="searchConfigKey"
                        />
                    </div>
                    <div v-if="panelKey !== 'leftPanel'" class="w-300 max-w-300 min-w-300">
                        <queries :panel-key="panelKey"/>
                        <dashboard-config :panel-key="panelKey"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Explorer from "./Explorer";
    import DashboardConfig from "./DashboardConfig";
    import Queries from "@/queries/queries";
    import IndexInfo from "@/dashboard/IndexInfo";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import IndexNew from "@/dashboard/IndexNew";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import Facets from "common/components/explorer/facets/Facets";

    import FlipLeftIcon from "common/icons/flip-left.svg";
    import FlipRightIcon from "common/icons/flip-right.svg";
    import MaximizeIcon from "common/icons/maximize.svg";
    import MinimizeIcon from "common/icons/minimize.svg";
    import ServerIcon from "common/icons/server.svg";
    import IndexDelete from "@/dashboard/IndexDelete";
    import Tooltip from "common/components/Tooltip";
    import SearchBox from "@/dashboard/SearchBox";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import panelsMixin from "common/mixins/panelsMixin";


    export default {
        name: 'Dashboard',
        props: ['panelKey'],
        mixins: [indexInfoMixin, panelsMixin],
        components: {
            SearchBox,
            Tooltip,
            IndexDelete,
            IndexNew,
            CustomSelect,
            IndexInfo,
            AppSelector,
            IndexSelector,
            Queries,
            DashboardConfig,
            Explorer,
            FlipLeftIcon,
            FlipRightIcon,
            ServerIcon,
            MaximizeIcon,
            MinimizeIcon,
            Facets
        },
        computed: {
            appId: { // Needed for indexInfoMixin
                get () {
                    return this.$store.state.panels[this.panelKey].appId;
                },
                set (appId) {
                    this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {appId: appId, indexName: null});
                }
            },
            indexName: { // Needed for indexInfoMixin
                get () {
                    return this.$store.state.panels[this.panelKey].indexName;
                },
                set (indexName) {
                    this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {appId: this.appId, indexName: indexName});
                }
            },
        },
    }
</script>