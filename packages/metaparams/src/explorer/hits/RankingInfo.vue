<template>
    <div>
        <div class="w-128 text-right mb-8 uppercase tracking-wide text-xs text-nova-grey">
            Ranking Info
        </div>
        <div class="flex">
            <div class="w-128 text-right">
                <div v-for="criterion in criteria" class="truncate">
                    {{criterion.label}}
                </div>
            </div>
            <div class="ml-12" style="width: calc(100% - 140px)">
                <div
                    v-for="criterion in criteria"
                    class="flex flex-wrap text-cosmos-black-opacity-70"
                >
                    <span
                        class="truncate px-2 mr-1"
                        :style="criterion.val !== criterion.oldVal ? 'background: rgba(84, 104, 255, 0.1); color: #5468ff;' : ''"
                    >
                        {{criterion.val}}
                        <span v-if="criterion.label === 'perso'">
                                (rankingScore: {{item._rankingInfo.personalization.rankingScore}},
                                filtersScore: {{item._rankingInfo.personalization.filtersScore}})
                        </span>
                    </span>
                    <span
                        v-if="i > 0 && criterion.val !== criterion.oldVal"
                        class="truncate"
                    >
                        <span class="text-sm">was</span> {{criterion.oldVal}}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import RankingInfoAnalyser from "@/explorer/hits/rankingInfoAnalyser"
    import {formatHumanDistance} from "../../../../common/utils/formatters"
    import paramsSpecs from 'common/utils/paramsSpecs'
    import indexInfoMixin from "@/mixins/indexInfoMixin";

    export default {
        name: 'RankingInfo',
        props: ['panelKey', 'item', 'previousItem', 'i'],
        mixins: [indexInfoMixin],
        computed: {
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.refIndexSettings);
            },
            searchableAttributes: function () {
                return this.refIndexSettings.searchableAttributes || this.refIndexSettings.attributesToIndex || paramsSpecs.searchableAttributes.default;
            },
            criteria: function () {
                const criterias = [];

                this.rankingInfoAnalyzer.getActualCriteria().forEach((criterionName) => {
                    const criterion = {
                        label: criterionName,
                        val: this.rankingInfoAnalyzer.getCriteriaValue(this.item, criterionName),
                        oldVal: this.rankingInfoAnalyzer.getCriteriaValue(this.previousItem, criterionName)
                    };

                    if (criterionName === 'geo') {
                        if (criterion.val !== null) criterion.val = formatHumanDistance(criterion.val);
                        if (criterion.oldVal !== null) criterion.oldVal = formatHumanDistance(criterion.oldVal);
                    }

                    if (criterionName === 'attribute') {
                        criterion.val = this.getBestMatchingAttribute(criterion.val);
                        criterion.oldVal = this.getBestMatchingAttribute(criterion.oldVal);
                    }

                    criterias.push(criterion);
                });

                return criterias.filter((criterion) => { return criterion.val !== null || criterion.oldVal !== null });
            }
        },
        methods: {
            getBestMatchingAttribute: function (attributePosition) {
                if (this.searchableAttributes.length <= 0) return 'No searchable attributes';
                return this.searchableAttributes[attributePosition]
            }
        }
    }
</script>