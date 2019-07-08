<template>
    <div>
        <params-panel :panel-key="panelKey" :config-key="searchConfigKey" />
        <div v-if="isLeftPanel || !sameIndexOnEachPanel">
            <params-panel :panel-key="panelKey" config-key="indexSettings" />
        </div>
    </div>
</template>

<script>
    import ParamsPanel from "@/dashboard/ParamsPanel";
    import panelsMixin from "@/mixins/panelsMixin";

    export default {
        name: 'DashboardConfig',
        components: {ParamsPanel},
        mixins: [panelsMixin],
        props: ['panelKey'],
    }
</script>