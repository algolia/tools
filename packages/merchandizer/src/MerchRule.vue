<template>
    <div v-if="rule" class="relative mb-48">
        <div v-if="!editMode" class="hit">
            <div class="w-full">
                <div class="flex items-center p-4 ml-2">
                    <div class="bg-proton-grey-opacity-40 rounded text-sm py-4 px-8">
                        rule: {{intermediateRule.objectID}}
                    </div>
                </div>
            </div>
            <div class="w-full p-8">
                <div
                    v-if="intermediateRule.conditions.some((c) => c.hasPatternAndAnchoring) || intermediateRule.conditions.some((c) => c.context)"
                    v-for="(condition, i) in intermediateRule.conditions"
                    :class="i > 0 ? 'mt-16' : ''"
                >
                    <div class="py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                        {{ i > 0 ? 'OR': ''}} Condition
                    </div>
                    <div>
                        <div
                            v-if="condition.hasPatternAndAnchoring"
                            class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20"
                        >
                            <div class="w-188">
                                if query <span v-html="properHighlight(condition.anchoring)"></span>
                            </div>
                            <div class="ml-4 text-cosmos-black-opacity-70">
                                "<span v-html="properHighlight(condition.pattern)"></span>"
                            </div>
                        </div>
                        <div v-if="condition.alternatives">
                            <div class="w-188">match with alternatives</div>
                        </div>
                        <div v-if="condition.context" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                            <div class="w-188">in context</div>
                            <div class="ml-4 text-cosmos-black-opacity-70" v-html="properHighlight(condition.context)"></div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                        Conditions
                    </div>
                    <div class="py-8 border-t border-proton-grey-opacity-20">
                        No condition - Always active
                    </div>
                </div>
                <div class="mt-16 py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                    Consequences
                </div>
                <div v-if="intermediateRule.automaticFacetFilters.length > 0" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">filter automatically on</div>
                    <div class="ml-4">
                        <div class="text-cosmos-black-opacity-70" v-for="filter in intermediateRule.automaticFacetFilters">
                            <span v-html="properHighlight(filter.facet)"></span><span v-if="filter.score !== 1">&lt;score="{{filter.score}}"&gt;</span>
                            <span class="ml-4" v-if="filter.disjunctive">disjunctive (OR)</span>
                        </div>
                    </div>
                </div>
                <div v-if="intermediateRule.automaticOptionalFacetFilters.length > 0" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">optionalFilter automatically on</div>
                    <div class="ml-4">
                        <div class="text-cosmos-black-opacity-70" v-for="filter in intermediateRule.automaticOptionalFacetFilters">
                            <span v-html="properHighlight(filter.facet)"></span><span v-if="filter.score !== 1">&lt;score="{{filter.score}}"&gt;</span>
                            <span class="ml-4" v-if="filter.disjunctive">disjunctive (OR)</span>
                        </div>
                    </div>
                </div>
                <div v-if="intermediateRule.replacedQuery !== false" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">replace query by</div>
                    <div class="ml-4 text-cosmos-black-opacity-70">
                        "<span v-html="properHighlight(intermediateRule.replacedQuery)"></span>"
                    </div>
                </div>
                <div v-if="intermediateRule.removedWordsFromQuery.length > 0" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">remove from query</div>
                    <div class="ml-4 mr-8 text-cosmos-black-opacity-70" v-for="word in intermediateRule.removedWordsFromQuery">
                        "<span v-html="properHighlight(word)"></span>"
                    </div>
                </div>
                <div v-if="intermediateRule.replacedWordsFromQuery.length > 0" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">replace in query</div>
                    <div class="ml-4">
                        <div class="mr-4 text-cosmos-black-opacity-70" v-for="word in intermediateRule.replacedWordsFromQuery">
                            "<span v-html="properHighlight(word[0])"></span>" => "<span v-html="properHighlight(word[1])"></span>"
                        </div>
                    </div>
                </div>
                <div v-if="intermediateRule.promote.length > 0" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">promote</div>
                    <div class="ml-4">
                        <div v-for="promoted in intermediateRule.promote" class="flex mb-8">
                            <promoted-hit
                                v-bind="$props"
                                v-on="$listeners"
                                :position="promoted.position"
                                :ids="promoted.objectIDs"
                            />
                        </div>
                    </div>
                </div>
                <div v-if="intermediateRule.filterPromotes > 0" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">promote follow filters</div>
                    <div class="ml-4 text-cosmos-black-opacity-70">
                        true
                    </div>
                </div>
                <div v-if="intermediateRule.hide.length > 0" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">hide</div>
                    <div class="ml-4">
                        <div v-for="hide in intermediateRule.hide" class="text-cosmos-black-opacity-70">
                            <promoted-hit
                                v-bind="$props"
                                v-on="$listeners"
                                :ids="[hide.objectID]"
                            />
                        </div>
                    </div>
                </div>
                <div v-if="Object.keys(intermediateRule.params).length > 0" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">apply params</div>
                    <div class="ml-4 text-cosmos-black-opacity-70">
                        <pre v-html="properHighlight(JSON.stringify(intermediateRule.params, null, 2))"></pre>
                    </div>
                </div>
                <div v-if="intermediateRule.userData" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">userData</div>
                    <div class="ml-4 text-cosmos-black-opacity-70">
                        <pre v-html="properHighlight(JSON.stringify(intermediateRule.userData, null, 2))"></pre>
                    </div>
                </div>
                <div
                    class="py-8 flex border-t border-proton-grey-opacity-20"
                    v-for="bloc in config.cms" v-if="intermediateRule.cms[bloc.name] !== undefined"
                >
                    <div class="min-w-188 w-188">{{ bloc.label }}</div>
                    <div class="ml-4 text-cosmos-black-opacity-70 min-w-0">
                        <div v-for="(el, i) in intermediateRule.cms[bloc.name]" class="mb-16 overflow-hidden">
                            <table>
                                <tr v-if="bloc.list">
                                    <td class="px-4 py-2 px-0">#{{ i }}</td>
                                    <td class="px-4 py-2 truncate"></td>
                                </tr>
                                <tr v-for="(specs, attr) in bloc.fields">
                                    <td class="px-4 py-2 px-0">{{ attr }}</td>
                                    <td class="px-4 py-2 truncate">{{ el[attr] }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <div v-if="intermediateRule.validity && intermediateRule.validity.length > 0" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">validity periods</div>
                    <div class="ml-4">
                        <div v-for="validityPeriod in intermediateRule.validity">
                            from
                            <span class="text-cosmos-black-opacity-70">
                            {{new Date(validityPeriod.from * 1000).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})}}
                        </span>
                            to
                            <span class="text-cosmos-black-opacity-70">
                            {{new Date(validityPeriod.until * 1000).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})}}
                        </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex">
                <div class="items-center ml-auto mr-8 justify-end">
                    <button class="relative group">
                        <edit-icon
                            class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="editMode = true"
                        />
                        <tooltip>Edit rule. Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <trash-icon
                            class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="confirmDelete = true"
                        />
                        <tooltip>Delete rule. Will ask for confirmation</tooltip>
                    </button>
                </div>
            </div>
        </div>
        <merch-rule-edit
            v-if="editMode"
            :rule="rule"
            v-bind="$props"
            v-on="$listeners"
            @onStopEdit="editMode = false"
        />
        <rule-delete
            v-if="confirmDelete"
            @onStopDelete="confirmDelete = false"
            :rule="rule"
            v-bind="$props"
            v-on="$listeners"
            class="my-12 mx-8"
        />
    </div>
</template>

<script>
import EditIcon from 'common/icons/edit.svg';
import TrashIcon from 'common/icons/trash.svg';
import FlipLeftIcon from "common/icons/flip-left.svg";
import FlipRightIcon from "common/icons/flip-right.svg";
import HitsTransformer from "common/components/explorer/hits/hitsTransformer";

import {highlightJsonObject, properHighlight} from 'common/utils/formatters';
import Tooltip from "common/components/Tooltip";
import RuleDelete from "common/components/explorer/synonyms-rules/RuleDelete";
import MerchRuleEdit from './MerchRuleEdit';
import IntermediateRule from "./intermediateRule";
import PromotedHit from "common/components/explorer/synonyms-rules/PromotedHit";
import props from "common/components/explorer/props";

const hitsTransformer = new HitsTransformer(['_highlightResult']);

export default {
    name: 'MerchRule',
    props: [
        'rule',
        'config',
        ...props.credentials,
        ...props.actions,
        ...props.images,
        ...props.attributes,
        ...props.paramsAndSettings,
    ],
    components: {PromotedHit, MerchRuleEdit, RuleDelete, Tooltip, EditIcon, TrashIcon, FlipLeftIcon, FlipRightIcon},
    data: function () {
        return {
            editMode: false,
            confirmDelete: false,
        };
    },
    computed: {
        intermediateRule: function () {
            return new IntermediateRule(hitsTransformer.transformObjSimple(this.rule));
        }
    },
    methods: {
        highlightJsonObject,
        properHighlight: properHighlight
    }
}
</script>
