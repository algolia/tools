<template>
    <rule v-if="rule"
          :rule="rule"
          v-bind="$props"
          v-on="$listeners"
    />
</template>

<script>
    import Rule from "./Rule";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";
    import props from "../props";

    export default {
        name: 'UnfetchedRule',
        components: {Rule},
        props: [
            'ruleId',
            ...props.credentials,
            ...props.actions,
            ...props.images,
            ...props.attributes,
            'keysIndexer',
        ],
        data: function () {
            return {
                rule: false,
            }
        },
        watch: {
            ruleId: function () {
                this.getRule();
            }
        },
        created: async function () {
            this.getRule();
        },
        methods: {
            getRule: async function () {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server);
                this.rule = await index.getRule(this.ruleId);
            }
        }
    }
</script>