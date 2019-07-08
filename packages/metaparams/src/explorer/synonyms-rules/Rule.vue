<template>
    <div v-if="rule" class="relative mb-48">
        <div v-if="!editMode" class="hit">
            <div class="w-full">
                <div class="flex items-center p-4 ml-2">
                    <input
                        v-if="checked !== undefined"
                        type="checkbox"
                        @input="$emit('updateChecked', $event.target.checked)"
                        :checked="checked"
                        class="mr-12"
                    />
                    <div class="bg-proton-grey-opacity-40 rounded text-sm py-4 px-8">
                        rule: {{intermediateRule.objectID}}
                    </div>
                    <div
                        v-if="intermediateRule.enabled !== undefined && !intermediateRule.enabled"
                        class="ml-12 bg-proton-grey-opacity-40 rounded text-sm py-4 px-8"
                    >
                        disabled
                    </div>
                </div>
            </div>
            <div class="w-full p-8">
                <div class="py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                    Condition
                </div>
                <div class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">if query <span v-html="properHighlight(intermediateRule.anchoring)"></span></div>
                    <div class="ml-4 text-cosmos-black-opacity-70">"<span v-html="properHighlight(intermediateRule.pattern)"></span>"</div>
                </div>
                <div v-if="intermediateRule.context" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">in context</div>
                    <div class="ml-4 text-cosmos-black-opacity-70">"{{intermediateRule.context}}"</div>
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
                <div v-if="intermediateRule.replacedWordsFromQuery.length > 0" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">replace in query</div>
                    <div class="ml-4">
                        <div class="mr-4 text-cosmos-black-opacity-70" v-for="word in intermediateRule.replacedWordsFromQuery">
                            "<span v-html="properHighlight(word[0])"></span>" => "<span v-html="properHighlight(word[1])"></span>"
                        </div>
                    </div>
                </div>
                <div v-if="intermediateRule.removedWordsFromQuery.length > 0" class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                    <div class="w-188">remove from query</div>
                    <div class="mr-8 text-cosmos-black-opacity-70" v-for="word in intermediateRule.removedWordsFromQuery">
                        "<span v-html="properHighlight(word)"></span>"
                    </div>
                </div>
                <div v-if="intermediateRule.promote.length > 0" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">promote</div>
                    <div class="ml-4">
                        <div v-for="promoted in intermediateRule.promote" class="flex mb-8">
                            <promoted-hit :panel-key="panelKey" :hit="promoted.hit" :id="promoted.objectID" :position="promoted.position" />
                        </div>
                    </div>
                </div>
                <div v-if="intermediateRule.hide.length > 0" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">hide</div>
                    <div class="ml-4">
                        <div v-for="hide in intermediateRule.hide" class="text-cosmos-black-opacity-70">
                            <span>{{hide.objectID}}</span>
                        </div>
                    </div>
                </div>
                <div v-if="Object.keys(intermediateRule.params).length > 0" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">apply params</div>
                    <div class="ml-4 text-cosmos-black-opacity-70">
                        <pre v-html="JSON.stringify(intermediateRule.params, null, 2)"></pre>
                    </div>
                </div>
                <div v-if="intermediateRule.userData" class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">userData</div>
                    <div class="ml-4 text-cosmos-black-opacity-70">
                        <pre v-html="JSON.stringify(intermediateRule.userData, null, 2)"></pre>
                    </div>
                </div>
            </div>
            <div class="flex">
                <div class="items-center ml-auto mr-8 justify-end">
                    <button class="relative group" v-if="canJump && panelKey === 'rightPanel'">
                        <flip-left-icon
                            class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="jumpRule"
                        />
                        <tooltip>Copy this synonym in the left panel index.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group" v-if="canJump && panelKey === 'leftPanel'">
                        <flip-right-icon
                            class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="jumpRule"
                        />
                        <tooltip>Copy this synonym in the right panel index.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <edit-icon
                            class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="editMode = true"
                        />
                        <tooltip>Edit synonym. Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <trash-icon
                            class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="confirmDelete = true"
                        />
                        <tooltip>Delete synonym. Will ask for confirmation</tooltip>
                    </button>
                </div>
            </div>
        </div>
        <rule-edit
            v-if="editMode"
            @onStopEdit="editMode = false"
            :panel-key="panelKey"
            :rule="rule"
        />
        <rule-delete
            v-if="confirmDelete"
            @onStopDelete="confirmDelete = false"
            :panel-key="panelKey"
            :rule="rule"
            class="my-12 mx-8"
        />
    </div>
</template>

<script>
    import EditIcon from '~/icons/edit.svg';
    import TrashIcon from '~/icons/trash.svg';
    import FlipLeftIcon from "~/icons/flip-left.svg";
    import FlipRightIcon from "~/icons/flip-right.svg";
    import HitsTransformer from "@/explorer/hits/hitsTransformer";

    import {highlightJsonObject, properHighlight} from 'common/src/utils/formatters';
    import Tooltip from "@/common/Tooltip";
    import RuleDelete from "@/explorer/synonyms-rules/RuleDelete";
    import RuleEdit from "@/explorer/synonyms-rules/RuleEdit";
    import IntermediateRule from "@/explorer/synonyms-rules/intermediateRule";
    import PromotedHit from "@/explorer/synonyms-rules/PromotedHit";

    const hitsTransformer = new HitsTransformer(['_highlightResult']);

    export default {
        name: 'Rule',
        props: ['rule', 'panelKey', 'canJump', 'checked'],
        components: {PromotedHit, RuleEdit, RuleDelete, Tooltip, EditIcon, TrashIcon, FlipLeftIcon, FlipRightIcon},
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
            jumpRule: function () {
                const otherPanelKey = this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
                this.$root.$emit(`${otherPanelKey}RuleJumping`, this.rule);
            },
            properHighlight: properHighlight
        }
    }
</script>