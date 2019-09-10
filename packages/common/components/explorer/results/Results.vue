<template>
    <div>
        <div v-if="searchResponse" class="flex mt-4">
            <div class="flex rounded overflow-hidden text-nova-grey">
                <div
                    @click="$emit('onUpdateDisplayMode', 'list')"
                    :class="displayMode === 'list' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <list-icon class="w-auto h-8 mr-4" />
                    <div class="text-sm">List</div>
                </div>
                <div
                    @click="$emit('onUpdateDisplayMode', 'images')"
                    :class="displayMode === 'images' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <grid-icon class="w-auto h-12 mr-4" />
                    <div class="text-sm">Images</div>
                </div>
                <div
                    @click="$emit('onUpdateDisplayMode', 'raw')"
                    :class="displayMode === 'raw' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <code-icon class="w-auto h-12 mr-4" />
                    <div class="text-sm">Raw</div>
                </div>
                <div
                    @click="$emit('onUpdateDisplayMode', 'charts')"
                    :class="displayMode === 'charts' ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                    class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                >
                    <bar-chart-icon class="w-auto h-12 mr-4" />
                    <div class="text-sm">Charts</div>
                </div>
            </div>
            <div v-if="!readOnly && displayMode === 'list'" class="ml-auto flex items-center">
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
            :allow-save-without-edit="jumpedHit !== null"
            :hit="jumpedHit"
            class="mt-16"
            @onStopEdit="isAddingRecord = false; jumpedHit = null"
            v-bind="$props"
            v-on="$listeners"
        />
        <div>
            <results-info
                v-if="searchResponse && !searchResponse.cursor"
                v-bind="$props"
                v-on="$listeners"
            />
            <results-list
                v-if="searchResponse && (displayMode === 'list' || displayMode === 'images')"
                v-on="$listeners"
                v-bind="$props"
            />
            <export-params
                v-if="displayMode === 'raw'"
                v-bind="$props"
            />
            <raw-response
                v-if="searchResponse && displayMode === 'raw'"
                v-bind="$props"
            />
            <ranking-charts
                v-if="analyseResponse && displayMode === 'charts'"
                v-on="$listeners"
                v-bind="$props"
            />
            <div
                v-if="displayMode === 'charts' && method === 'browse'"
                class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8"
            >
                Not available in browse mode.
            </div>
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
    import HitEdit from "../hits/HitEdit";
    import Tooltip from "../../Tooltip";
    import PerformSearch from "./PerformSearch";
    import ResultsInfo from "./ResultsInfo";
    import props from '../props';

    export default {
        name: 'Results',
        props: [
            'panelKey',
            'disablePagination',
            ...props.credentials,
            ...props.images,
            ...props.attributes,
            ...props.paramsAndSettings,
            ...props.response,
            ...props.display,
            ...props.actions,
        ],
        components: {
            ResultsInfo,
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
            }
        },
    }
</script>