<template>
    <div>
        <div v-if="errorMessage.length > 0" class="border border-mars-1 m-16 p-8 rounded">
            <div>{{errorMessage}}</div>
            <div v-if="errorMessage.includes('Invalid Application-ID or API key')" class="mt-12">
                <div>App Id: {{panelAppId}}</div>
                <div>API Key: <input v-model="panelAdminAPIKey" class="input-custom inline" placeholder="adminAPIKey" /></div>
            </div>
        </div>
        <div class="flex mt-4">
            <div class="flex rounded overflow-hidden text-nova-grey">
                <div
                    @click="displayMode = 'list'"
                    :class="displayMode === 'list' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <list-icon class="w-auto h-8 mr-4" />
                    <div class="text-sm">List</div>
                </div>
                <div
                    @click="displayMode = 'images'"
                    :class="displayMode === 'images' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <grid-icon class="w-auto h-12 mr-4" />
                    <div class="text-sm">Images</div>
                </div>
                <div
                    @click="displayMode = 'raw'"
                    :class="displayMode === 'raw' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <code-icon class="w-auto h-12 mr-4" />
                    <div class="text-sm">Raw</div>
                </div>
                <div
                    @click="displayMode = 'charts'"
                    :class="displayMode === 'charts' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <bar-chart-icon class="w-auto h-12 mr-4" />
                    <div class="text-sm">Charts</div>
                </div>
            </div>
            <div v-if="!isReadOnly && displayMode === 'list'" class="ml-auto flex items-center">
                <button class="relative group">
                    <plus-circle-icon
                        @click="isAddingRecord = true"
                        class="w-16 h-16 text-nova-grey-opacity-60 cursor-pointer hover:text-telluric-blue"
                    />
                    <tooltip>Add record(s)</tooltip>
                </button>
            </div>
        </div>
        <hit-edit
            v-if="isAddingRecord"
            :panel-key="panelKey"
            :allow-save-without-edit="jumpedHit !== null"
            :hit="jumpedHit"
            class="mt-16"
            @onStopEdit="isAddingRecord = false; jumpedHit = null"
        />
        <div>
            <perform-search
                :search-params="searchParams"
                :search-params-raw="searchParamsRaw"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                :server="panelServer"
                :index-name="panelIndexName"
                @onFetchHits="onFetchHits"
                @onUpdateAlgoliaResponse="algoliaResponse = $event"
                @onUpdateError="errorMessage = $event"
                @onUpdateAnalyseAlgoliaResponse="analyseAlgoliaResponse = $event"
            />
            <results-list v-if="algoliaResponse && (displayMode === 'list' || displayMode === 'images')"
                          :panel-key="panelKey" :algolia-response="algoliaResponse" :display-mode="displayMode" :read-only="readOnly" />
            <export-params v-if="displayMode === 'raw'" :panel-key="panelKey" />
            <raw-response v-if="displayMode === 'raw'" :algolia-response="algoliaResponse" />
            <ranking-charts v-if="analyseAlgoliaResponse && displayMode === 'charts'"
                            :panelKey="panelKey" :hits="analyseAlgoliaResponse.hits" />
        </div>
    </div>
</template>

<script>
    import ListIcon from 'common/icons/list.svg'
    import BarChartIcon from 'common/icons/bar-chart.svg'
    import CodeIcon from 'common/icons/code.svg'
    import GridIcon from 'common/icons/grid.svg'
    import PlusCircleIcon from "common/icons/plus-circle.svg";

    import ResultsList from "./ResultsList";
    import RankingCharts from "../analysis/RankingCharts";
    import RawResponse from "../raw/RawResponse";
    import ExportParams from "../export-params/ExportParams";
    import indexInfoMixin from "../../../mixins/indexInfoMixin";
    import HitEdit from "../hits/HitEdit";
    import Tooltip from "../../Tooltip";
    import PerformSearch from "./PerformSearch";

    export default {
        name: 'Results',
        props: ['panelKey', 'readOnly'],
        mixins: [indexInfoMixin],
        components: {
            PerformSearch,
            Tooltip,
            HitEdit, ExportParams, RawResponse, RankingCharts, ResultsList, ListIcon, BarChartIcon, CodeIcon, GridIcon, PlusCircleIcon},
        created: function () {
            this.$root.$on(`${this.panelKey}HitJumping`, (record) => {
                this.isAddingRecord = true;
                this.jumpedHit = record;
            });
        },
        data: function () {
            return {
                isAddingRecord: false,
                jumpedHit: null,
                algoliaResponse: null,
                analyseAlgoliaResponse: null,
                errorMessage: '',
            }
        },
        computed: {
            displayMode: {
                get () {
                    return this.$store.state.panels[this.panelKey].displayMode || 'list';
                },
                set (value) {
                    this.$store.commit(`panels/${this.panelKey}/setDisplayMode`, value);
                }
            },
        },
        methods: {
            onFetchHits: function (algoliaResponse) {
                this.algoliaResponse = algoliaResponse;
                this.$emit('onFetchHits', algoliaResponse);
            }
        }
    }
</script>