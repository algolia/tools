<script>
    import { Bar, mixins } from 'vue-chartjs';
    import chartjsPluginAnnotation from "chartjs-plugin-annotation";
    const { reactiveProp } = mixins;

    export default {
        name: 'BarChart',
        extends: Bar,
        mixins: [reactiveProp],
        props: ['options', 'chartData'],
        mounted: function () {
            this.addPlugin(chartjsPluginAnnotation);
            this.renderChart(this.chartData, this.options);
        },
    }
</script>
