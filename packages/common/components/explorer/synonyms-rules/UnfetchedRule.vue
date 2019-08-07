<template>
    <rule v-if="rule" :rule="rule" :can-jump="canJump" :panel-key="panelKey" />
</template>

<script>
    import Rule from "./Rule";
    import indexMixin from "../../../mixins/indexMixin";

    export default {
        name: 'UnfetchedRule',
        components: {Rule},
        props: ['panelKey', 'ruleId', 'canJump'],
        mixins: [indexMixin],
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
                const index = await this.getSearchIndex();
                this.rule = await index.getRule(this.ruleId);
            }
        }
    }
</script>