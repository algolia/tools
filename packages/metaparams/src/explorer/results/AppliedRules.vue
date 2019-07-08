<template>
    <div v-if="algoliaResponse.appliedRules" class="mt-32 break-words">
        <div>
            <div v-for="(o, i) in algoliaResponse.appliedRules" :key="`${key}-${o.objectID}`">
                <unfetched-rule :panel-key="panelKey" :rule-id="o.objectID" :canJump="canJump"/>
            </div>
        </div>
    </div>
</template>

<script>
    import UnfetchedRule from "@/explorer/synonyms-rules/UnfetchedRule";
    import panelsMixin from "@/mixins/panelsMixin";
    export default {
        name: 'AppliedRules',
        components: {UnfetchedRule},
        mixins: [panelsMixin],
        props: ['panelKey', 'algoliaResponse'],
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
        computed: {
            canJump: function () {
                if (!this.$store.state.panels.splitMode) return false;
                if (this.sameIndexOnEachPanel) return false;

                const otherPanelKey = this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';

                return this.$store.state.panels[otherPanelKey].currentTab === 'rules';
            },
        },
    }
</script>