<template>
    <div>
        <div v-if="searchResponse" class="flex mt-4">
            <small-tabs
                :value="displayMode"
                @input="$emit('onUpdateDisplayMode', $event)"
                :tabs="[
                    {value: 'list', name: 'List', icon: ListIcon},
                    {value: 'images', name: 'Images', icon: GridIcon},
                    {value: 'raw', name: 'Raw', icon: CodeIcon},
                    {value: 'charts', name: 'Charts', icon: BarChartIcon},
                ]"
            />
            <div v-if="!readOnly && !isReplica && displayMode === 'list'" class="ml-auto flex items-center">
                <button class="relative group">
                    <plus-circle-icon
                        @click="isAddingRecord = true"
                        class="w-16 h-16 text-nova-grey-opacity-60 cursor-pointer hover:text-telluric-blue"
                    />
                    <tooltip>Add record(s)</tooltip>
                </button>
            </div>
        </div>
        <div v-if="jumpedToReadOnly" class="my-12 bg-saturn-5 rounded text-solstice-blue-opacity-80 p-8">
            This panel is in readonly mode
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
    import SmallTabs from "../../tabs/SmallTabs";
    import indexInfoMixin from "../../../mixins/indexInfoMixin";

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
        mixins: [indexInfoMixin],
        components: {
            SmallTabs,
            ResultsInfo,
            PerformSearch,
            Tooltip,
            HitEdit, ExportParams, RawResponse, RankingCharts, ResultsList, PlusCircleIcon},
        data: function () {
            return {
                isAddingRecord: false,
                jumpedHit: null,
                ListIcon,
                GridIcon: GridIcon,
                CodeIcon: CodeIcon,
                BarChartIcon: BarChartIcon,
                jumpedToReadOnly: false,
            }
        },
        created: function () {
            this.$root.$on(`${this.panelKey}HitJumping`, (record) => {
                if (!this.readOnly && !this.isReplica) {
                    this.isAddingRecord = true;
                    this.jumpedHit = record;
                } else {
                    this.jumpedToReadOnly = true;
                    window.setTimeout(() => {
                        this.jumpedToReadOnly = false;
                    }, 10000);
                }
            });
        },
    }
</script>
