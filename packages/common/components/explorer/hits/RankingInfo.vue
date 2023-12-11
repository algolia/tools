<template>
    <div>
        <div class="w-128 text-right mb-8 uppercase tracking-wide text-xs text-nova-grey">
            Ranking Info
        </div>
        <div>
            <div
                v-for="criterion in criteria"
                :key="criterion.label"
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
        <div v-if="item._rankingInfo.hasOwnProperty('semanticScore')" class="flex text-cosmos-black-opacity-70 mt-8">
            <div class="w-128 text-right truncate">
                vector score
            </div>
            <div class="ml-12 flex flex-wrap" style="width: calc(100% - 140px)">
                <div class="truncate hover:overflow-visible px-2 mr-1 relative group">
                    {{formatFloat(item._rankingInfo.semanticScore)}}
                    <tooltip position="right">similarity score computed by vector engine</tooltip>
                </div>
            </div>
        </div>
        <div v-if="item._rankingInfo && item._rankingInfo.personalization" class="mt-16">
            <div class="w-128 text-right mb-8 uppercase tracking-wide text-xs text-nova-grey">
                Perso Info
            </div>
            <div v-for="k in Object.keys(item._rankingInfo.personalization)" :key="k" class="flex text-cosmos-black-opacity-70">
                <div class="w-128 text-right truncate">
                    {{k}}
                </div>
                <div class="ml-12 flex flex-wrap" style="width: calc(100% - 140px)">
                    <div class="truncate hover:overflow-visible px-2 mr-1">
                        {{item._rankingInfo.personalization[k]}}
                    </div>
                </div>
            </div>
        </div>
        <div v-if="item._rankingInfo && hasNeuralScores" class="mt-16">
            <div class="w-128 text-right mb-8 uppercase tracking-wide text-xs text-nova-grey">
                Neural Merge Info
            </div>
            <div v-for="mergeInfo in neuralMergeInfo"
                 :key="mergeInfo.label"
                 class="flex text-cosmos-black-opacity-70">
                <div class="w-128 text-right truncate">
                    {{ mergeInfo.label }}
                </div>
                <div class="ml-12 flex flex-wrap" style="width: calc(100% - 140px)">
                    <div class="truncate hover:overflow-visible px-2 mr-1 relative group">
                        {{ mergeInfo.val }}
                        <tooltip v-if="mergeInfo.description !== undefined" position="right">{{mergeInfo.description}}</tooltip>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import RankingInfoAnalyser from "./rankingInfoAnalyser"
    import paramsSpecs from '../../../params-specs';
    import Tooltip from "../../Tooltip";

    export default {
        name: 'RankingInfo',
        components: {Tooltip},
        props: ['item', 'previousItem', 'i', 'indexSettings', 'searchParams', 'neuralSearchInfo'],
        data: function() {
            return {
                active: {},
            }
        },
        computed: {
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.indexSettings);
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
            },
            hasNeuralScores: function () {
                return Object.hasOwn(this.item._rankingInfo, 'neuralScore') && this.neuralSearchInfo;
            },
            neuralMergeInfo: function () {
                const value = (position, score, weight) => {
                    return `position: ${isNaN(position) ? "-" : position} , score: ${score}, weight: ${weight}`;
                }

                const inputInfo = this.neuralSearchInfo.inputs.map((input) => {
                    const position = parseInt(this.item._rankingInfo.mergeInfo[input]) + 1;
                    return {
                        name: input,
                        position: position,
                        score: this.formatFloat(!position ? 0 : 1 / Math.sqrt(position)),
                        weight: this.formatFloat(this.neuralSearchInfo.rrfWeights[input])
                    };
                });
                const numeratorDetails = inputInfo.map(data => `(${data.weight} * ${data.score})`).join(" + ");
                const denominatorDetails = inputInfo.map(data => data.weight).join(" + ");

                const mergeInfo = inputInfo.map((info) => ({
                    label: info.name,
                    val: value(info.position, info.score, info.weight),
                    description: isNaN(info.position)
                        ? "hit did not appear in the input list, score = 0.0"
                        : `score = 1/√position = 1/${this.formatFloat(Math.sqrt(info.position))}`
                }));
                mergeInfo.push({
                    label: 'final',
                    val: value(
                        this.i + 1,
                        this.formatFloat(this.item._rankingInfo['neuralScore']),
                        this.formatFloat(this.neuralSearchInfo.inputs.reduce(
                            (a, input) => a + this.neuralSearchInfo.rrfWeights[input], 0)),
                    ),
                    description: `score = weighted average of scores = (${numeratorDetails} / (${denominatorDetails}))`
                });
                return mergeInfo;
            }
        },
        methods: {
            formatFloat: function (score) {
                score = Math.round(parseFloat(score)*10000)/10000;
                return Number.isInteger(score) ? score.toFixed(1) : score;
            },
            getBestMatchingAttribute: function (attributePosition) {
                if (this.searchableAttributes.length <= 0) return 'No searchable attributes';
                return this.searchableAttributes[attributePosition]
            }
        }
    }
</script>
