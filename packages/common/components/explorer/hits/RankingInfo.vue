<template>
    <div>
        <div class="w-128 text-right mb-8 uppercase tracking-wide text-xs text-nova-grey">
            Ranking Info
        </div>
        <div>
            <div
                v-for="criterion in criteria"
                class="flex text-cosmos-black-opacity-70"
            >
                <div class="w-128 text-right truncate">
                    {{criterion.label}}
                </div>
                <div class="ml-12 flex flex-wrap" style="width: calc(100% - 140px)">
                    <div
                        class="truncate hover:overflow-visible px-2 mr-1"
                        :style="criterion.val !== criterion.oldVal ? 'background: rgba(84, 104, 255, 0.1); color: #5468ff;' : ''"
                    >
                        {{criterion.val}}
                    </div>
                    <div
                        v-if="i > 0 && criterion.val !== criterion.oldVal"
                        class="truncate hover:overflow-visible"
                    >
                        <span class="text-sm">was</span> {{criterion.oldVal}}
                    </div>
                    <div
                        v-if="criterion.extraInfo"
                        class="truncate hover:overflow-visible ml-4 text-nova-grey-opacity-80"
                    >
                        {{criterion.extraInfo}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import RankingInfoAnalyser from "./rankingInfoAnalyser"
    import paramsSpecs from '../../../params-specs';

    export default {
        name: 'RankingInfo',
        props: ['item', 'previousItem', 'i', 'indexSettings', 'searchParams'],
        computed: {
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.indexSettings, this.searchParams);
            },
            searchableAttributes: function () {
                return this.indexSettings.searchableAttributes || this.indexSettings.attributesToIndex || paramsSpecs.searchableAttributes.default;
            },
            isTypoStrictOrMin: function () {
                if (this.searchParams && this.searchParams.typoTolerance !== undefined) {
                    return ['strict', 'min'].indexOf(this.searchParams.typoTolerance) !== -1;
                }
                return ['strict', 'min'].indexOf(this.indexSettings.typoTolerance) !== -1;
            },
            criteria: function () {
                const criterias = [];

                this.rankingInfoAnalyzer.getActualCriteria(this.searchParams).forEach((criterionName) => {
                    const criterion = {
                        label: criterionName,
                        val: this.rankingInfoAnalyzer.getCriterionValue(this.item, criterionName),
                        oldVal: this.rankingInfoAnalyzer.getCriterionValue(this.previousItem, criterionName)
                    };

                    if (this.isTypoStrictOrMin && criterionName === 'typo') {
                        criterion.extraInfo = `// typo first because typoTolerance=${this.indexSettings.typoTolerance || this.searchParams.typoTolerance}`;
                    }

                    if (criterionName === 'geo') {
                        if (criterion.val !== null) criterion.val = `${criterion.val} meters`;
                        if (criterion.oldVal !== null) criterion.oldVal = `${criterion.oldVal}`;
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
