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
                        condition: {pattern: query, anchoring: 'is', context: context || undefined, alternatives: true, filters: currentActiveFilters},
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
        'searchParams',
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

        this.$root.$on('onWantToUnpromote', (objectID) => {
            for (let i = 0; i < this.rules.length; i++) {
                const merchRule = this.$refs[`rule-${i}`][0];

                if (merchRule.editMode) {
                    const merchRuleEdit = merchRule.$refs['merch-rule-edit'];
                    const newRule = merchRuleEdit.newRule;

                    // If we find the promote in a rule currently being edited
                    for (let j = 0; j < newRule.promote.length; j++) {
                        const pos = newRule.promote[j].objectIDs.findIndex((id) => id === objectID);
                        if (pos !== -1) {
                            newRule.promote[j].objectIDs.splice(pos, 1)
                            if (newRule.promote[j].objectIDs.length <= 0) {
                                newRule.promote.splice(j, 1)
                            }
                            if (newRule.promote.length <= 0) {
                                newRule.hasPromote = false;
                            }
                            return;
                        }
                    }
                }

                if (merchRule.intermediateRule.promote.find((promote) => promote.objectIDs.includes(objectID))) {
                    merchRule.editMode = true;
                    this.$nextTick(() => {
                        this.$root.$emit('onWantToUnpromote', objectID);
                    });
                    return;
                }
            }
        });

        this.$root.$on('onWantToHide', (objectID) => {
            this.$root.$emit('onWantToUnpromote', objectID);

            this.$nextTick(() => { // In case a rule was unpromoted we'll already be in editMode
                for (let i = 0; i < this.rules.length; i++) {
                    const merchRule = this.$refs[`rule-${i}`][0];

                    // If we find a rule in edit mode, use it
                    if (merchRule.editMode) {
                        const merchRuleEdit = merchRule.$refs['merch-rule-edit'];
                        const newRule = merchRuleEdit.newRule;

                        newRule.hasHide = true;
                        merchRuleEdit.addHide({objectID});
                        return;
                    }

                    // If we find a rule with a condition matching the query put it in edit mode and retrigger the event
                    if (merchRule.intermediateRule.conditions.some((c) => c.hasPatternAndAnchoring && c.pattern === this.query)) {
                        merchRule.editMode = true;
                        this.$nextTick(() => {
                            this.$root.$emit('onWantToHide', objectID);
                        });
                        return;
                    }
                }

                // If we didn't find a rule to add the hide to, we create a newRule and add the hide to it
                if (!this.isAdding) {
                    this.isAdding = true;
                }

                this.$nextTick(() => {
                    const newMerchRuleEdit = this.$refs['rule-new'];
                    const newRule = newMerchRuleEdit.newRule;
                    newRule.hasHide = true;
                    newMerchRuleEdit.addHide({objectID});
                });
            })
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
        },
        currentActiveFilters: function () {
            if (!this.searchParams.facetFilters || this.searchParams.facetFilters.length <= 0) {
                return '';
            }

            return this.searchParams.facetFilters.map((f) => {
                if (Array.isArray(f)) {
                    return f.map((filter) => {
                        const parts = filter.split(':');
                        return `"${parts[0]}":"${parts[1]}"`;
                    }).join(' OR ');
                }
                const parts2 = f.split(':');
                return `"${parts2[0]}":"${parts2[1]}"`;

            }).join(' AND ');
        },
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
