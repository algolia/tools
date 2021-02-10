<script>
    import { Line, mixins } from 'vue-chartjs';
    import chartjsPluginAnnotation from "chartjs-plugin-annotation";
    const { reactiveProp } = mixins;

    export default {
        name: 'LineChart',
        extends: Line,
        mixins: [reactiveProp],
        props: ['options'],
        mounted: function () {
            this.addPlugin(chartjsPluginAnnotation);
            this.renderChart(this.chartData, this.options);
        },
    }
</script>
