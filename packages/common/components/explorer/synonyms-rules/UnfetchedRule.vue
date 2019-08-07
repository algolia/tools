<template>
    <rule v-if="rule" :rule="rule" :can-jump="canJump" :panel-key="panelKey" />
</template>

<script>
    import Rule from "./Rule";
    import indexInfoMixin from "../../../mixins/indexInfoMixin";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";

    export default {
        name: 'UnfetchedRule',
        components: {Rule},
        props: ['panelKey', 'ruleId', 'canJump'],
        mixins: [indexInfoMixin],
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
                const index = await getSearchIndex(this.panelAppId, this.panelAdminAPIKey, this.panelIndexName, this.panelServer);
                this.rule = await index.getRule(this.ruleId);
            }
        }
    }
</script>