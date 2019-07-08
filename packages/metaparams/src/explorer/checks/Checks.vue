<template>
    <div>
        <div v-for="report in reports" class="mb-24">
            <div>{{ report.severity }}</div>
            <div v-html="report.message"></div>
        </div>
    </div>
</template>

<script>
    import SettingsChecker from "common/utils/settingsChecker"
    import indexInfoMixin from "@/mixins/indexInfoMixin";

    export default {
        name: 'Checks',
        props: ['panelKey'],
        mixins: [indexInfoMixin],
        data: function () {
            return {
                settingsChecker: new SettingsChecker(),
            };
        },
        computed: {
            panelIndexAnalyzer: function () {
                if (this.panelIndexData.indexAnalyzer) {
                    return this.panelIndexData.indexAnalyzer;
                }
                return null
            },
            reports: function () {
                if (!this.panelIndexAnalyzer) return [];

                this.settingsChecker.computeReports(this.panelIndexAnalyzer, this.indexSettings, this.searchParams);
                this.$emit('onUpdateCount', this.settingsChecker.reports.length);
                return this.settingsChecker.reports;
            },
        }
    }
</script>