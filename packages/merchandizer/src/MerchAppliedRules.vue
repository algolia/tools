<template>
    <div>
        <div class="flex">
            <button
                v-if="!isAdding"
                @click="isAdding = true"
                class="mt-12 mx-auto block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
            >
                Create new Rule
            </button>
        </div>
        <div
            v-if="isAdding"
            class="my-12"
        >
            <merch-rule-edit
                @onStopEdit="isAdding = false"
                ref="rule-new"
                v-bind="$props"
                :imageSize="config.images.imageSize"
                :imageAttribute="config.images.imageAttribute"
                :imageBaseUrl="config.images.imageBaseUrl"
                :imageSuffixUrl="config.images.imageSuffixUrl"
                :ignoreImageProxy="config.images.ignoreImageProxy"
                :titleAttributeName="config.images.titleAttributeName"
                v-on="$listeners"
                :rule="{
                        objectID: `rule-${Math.random().toString(36).substr(2, 9)}`,
                        condition: {pattern: query, anchoring: 'is', context: context || undefined, alternatives: true},
                        consequence: {}
                    }"
            />
        </div>
        <div v-if="rules.length > 0" class="mt-32 break-words">
            <div>
                <div v-for="(rule, i) in rules" :key="`${rule.objectID}`">
                    <merch-rule
                        :ref="`rule-${i}`"
                        :rule="rule"
                        :imageSize="config.images.imageSize"
                        :imageAttribute="config.images.imageAttribute"
                        :imageBaseUrl="config.images.imageBaseUrl"
                        :imageSuffixUrl="config.images.imageSuffixUrl"
                        :ignoreImageProxy="config.images.ignoreImageProxy"
                        :titleAttributeName="config.images.titleAttributeName"
                        v-bind="$props"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import props from "common/components/explorer/props";
import {getSearchIndex} from "common/utils/algoliaHelpers";
import MerchRuleEdit from "./MerchRuleEdit";
import MerchRule from "./MerchRule";

export default {
    name: 'MerchAppliedRules',
    components: {MerchRule, MerchRuleEdit},
    props: [
        ...props.credentials,
        ...props.images,
        ...props.actions,
        ...props.attributes,
        'keysIndexer',
        'config',
        'query',
        'context',
    ],
    data: function () {
        return {
            isAdding: false,
            rules: [],
            searchResponse: null,
            panelKey: 'leftPanel',
        }
    },
    created: function () {
        this.loadRules();
        this.$root.$on(`${this.panelKey}UpdateResponse`, (response) => {
            this.searchResponse = response;
        });

        this.$root.$on('onWantToPromoteAtPosition', ($event) => {
            for (let i = 0; i < this.rules.length; i++) {
                const merchRule = this.$refs[`rule-${i}`][0];

                if (merchRule.editMode) {
                    const merchRuleEdit = merchRule.$refs['merch-rule-edit'];
                    const newRule = merchRuleEdit.newRule;

                    for (let j = 0; j < newRule.conditions.length; j++) {
                        // If we find a rule in edit mode with pattern and anchoring use it
                        if (newRule.conditions[j].hasPatternAndAnchoring) {
                            newRule.hasPromote = true;
                            merchRuleEdit.addPromote($event, undefined, $event.position);
                            return;
                        }
                    }
                }

                // If we find a rule with a condition matching the query put it in edit mode and retrigger the event
                if (merchRule.intermediateRule.conditions.some((c) => c.hasPatternAndAnchoring && c.pattern === this.query)) {
                    merchRule.editMode = true;
                    this.$nextTick(() => {
                        this.$root.$emit('onWantToPromoteAtPosition', $event);
                    });
                    return;
                }
            }

            // If we didn't find a rule to add the promote to, we create a newRule and add the promote to it
            if (!this.isAdding) {
                this.isAdding = true;
            }

            this.$nextTick(() => {
                const newMerchRuleEdit = this.$refs['rule-new'];
                const newRule = newMerchRuleEdit.newRule;
                newRule.hasPromote = true;
                newMerchRuleEdit.addPromote($event, undefined, $event.position);
            });
        });
    },
    watch: {
        ruleIds: function () {
            this.loadRules();
        }
    },
    computed: {
        ruleIds: function () {
            if (!this.searchResponse || !this.searchResponse.appliedRules) return [];
            return this.searchResponse.appliedRules.map((r) => r.objectID);
        }
    },
    methods: {
        loadRules: async function () {
            if (!this.appId || !this.apiKey || this.ruleIds.length <= 0) {
                this.rules = [];
                return;
            }

            const index = await getSearchIndex(this.appId, this.apiKey, this.indexName);
            const promises = this.ruleIds.map((id) => index.getRule(id))
            this.rules = await Promise.all(promises);
        }
    }
}
</script>
