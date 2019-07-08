<template>
    <div>
        <div v-if="!saving">
            <div class="flex justify-end">
                <div v-if="saveError" class="border border-mars-1 mr-8 p-8 rounded">
                    {{saveError}}
                </div>
                <button
                    class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8"
                    @click="save"
                >
                    <span v-if="action === 'enableAllRules'">Enable {{batchable.length}} rules</span>
                    <span v-if="action === 'disableAllRules'">Disable {{batchable.length}} rules</span>
                    <span v-if="action === 'deleteAllRules'">Delete {{batchable.length}} rules</span>
                    <span v-if="action === 'deleteAllSynonyms'">Delete {{batchable.length}} synonyms</span>
                </button>
                <button
                    class="ml-8 bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
                    @click="$emit('onStopEdit')"
                >
                    Cancel
                </button>
            </div>
        </div>
        <div v-if="saving" class="flex items-center justify-center text-nova-grey-opacity-80 py-48">
            <loader-icon  class="w-24 h-24 infinte-rotate" />
            <div class="ml-16">Applying batch operation</div>
        </div>
    </div>
</template>

<script>
    import LoaderIcon from 'common/icons/loader.svg'
    import indexMixin from "@/mixins/indexMixin";

    export default {
        name: 'RuleBatch',
        props: ['action', 'batchable', 'panelKey'],
        components: {LoaderIcon},
        mixins: [indexMixin],
        data: function () {
            return {
                saveError: null,
                saving: false,
            };
        },
        methods: {
            getRulesEnabled: function () {
                return this.batchable.map((obj) => {
                    return {
                        ...obj,
                        enabled: true,
                    };
                });
            },
            getRulesDisabled: function () {
                return this.batchable.map((obj) => {
                    return {
                        ...obj,
                        enabled: false,
                    };
                });
            },
            save: async function () {
                const index = await this.getSearchIndex();
                try {
                    let task;
                    if (this.action === 'enableAllRules') {
                        task = await index.batchRules(this.getRulesEnabled(), { forwardToReplicas: this.forwardToReplicas });
                    }

                    if (this.action === 'disableAllRules') {
                        task = await index.batchRules(this.getRulesDisabled(), { forwardToReplicas: this.forwardToReplicas });
                    }

                    if (this.action === 'deleteAllRules') {
                        let i;
                        for (i = 0; i < this.batchable.length; i++) {
                            task = await index.deleteRule(this.batchable[i].objectID, { forwardToReplicas: this.forwardToReplicas });
                        }
                    }

                    if (this.action === 'deleteAllSynonyms') {
                        let i;
                        for (i = 0; i < this.batchable.length; i++) {
                            task = await index.deleteSynonym(this.batchable[i].objectID, { forwardToReplicas: this.forwardToReplicas });
                        }
                    }

                    this.saving = true;
                    await index.waitTask(task['taskID']);
                    this.saving = false;
                    this.$emit('onStopEdit');
                    this.$root.$emit('shouldTriggerSearch', this.panelIndexName);
                    this.$root.$emit('shouldTriggerRulesSearch', this.panelIndexName);
                    this.$root.$emit('shouldTriggerSynonymsSearch', this.panelIndexName);
                } catch (e) {
                    this.saveError = e.message;
                }
            },
        }
    }
</script>