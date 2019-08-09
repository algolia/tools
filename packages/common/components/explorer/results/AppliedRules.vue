<template>
    <div v-if="searchResponse.appliedRules" class="mt-32 break-words">
        <div>
            <div v-for="(o, i) in searchResponse.appliedRules" :key="`${key}-${o.objectID}`">
                <unfetched-rule :rule-id="o.objectID"
                                v-bind="$props"
                                v-on="$listeners"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import UnfetchedRule from "../synonyms-rules/UnfetchedRule";
    import props from "../props";

    export default {
        name: 'AppliedRules',
        components: {UnfetchedRule},
        props: [
            ...props.response,
            ...props.credentials,
            ...props.images,
            ...props.actions,
            ...props.attributes,
            'keysIndexer',
        ],
        data: function () {
            return {
                key: 0,
            }
        },
        created: function () {
            this.$root.$on('shouldTriggerRulesSearch', () => {
                this.key = this.key + 1;
            });
        },
    }
</script>