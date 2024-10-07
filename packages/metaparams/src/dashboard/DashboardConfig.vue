<template>
    <div>
        <params-panel :panel-key="panelKey" :config-key="searchConfigKey" :read-only="readOnly" />
        <div v-if="isLeftPanel || !sameIndexOnEachPanel">
            <params-panel :panel-key="panelKey" config-key="indexSettings" :read-only="readOnly" />
        </div>
    </div>
</template>

<script>
    import ParamsPanel from "@/dashboard/ParamsPanel.vue";
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'DashboardConfig',
        components: {ParamsPanel},
        mixins: [panelsMixin],
        props: ['panelKey', 'readOnly'],
    }
</script>
