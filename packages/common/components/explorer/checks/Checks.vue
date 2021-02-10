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

    export default {
        name: 'Checks',
        props: [
            'indexSettings', 'searchParams', 'indexAnalyser'
        ],
        data: function () {
            return {
                settingsChecker: new SettingsChecker(),
            };
        },
        computed: {
            reports: function () {
                if (!this.indexAnalyser) return [];

                this.settingsChecker.computeReports(this.indexAnalyser, this.indexSettings, this.searchParams);
                this.$emit('onUpdateCount', this.settingsChecker.reports.length);
                return this.settingsChecker.reports;
            },
        }
    }
</script>