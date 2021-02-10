<template>
    <div>
        <line-chart :options="chartOption" :chart-data="chartData" />
    </div>
</template>

<script>
    import LineChart from "common/components/explorer/analysis/LineChart";

    export default {
        props: ['data', 'attributeName'],
        name: 'DistributionChart',
        components: {LineChart},
        computed: {
            chartOption: function () {
                return {
                    maintainAspectRatio: false,
                    position: 'left',
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    elements: {
                        point:{
                            radius: 0
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                fontSize: 10,
                            },
                        }],
                        xAxes: [{
                            stepSize: 1,
                            ticks: {
                                fontSize: 10,
                            },
                        }],
                    },
                }
            },
            chartData: function () {
                const sampling = 1000;
                const samplingStep = Math.max(1, Math.floor(this.data.values.numericValues.length / sampling));
                const nbPoints = Math.min(sampling + 1, this.data.values.numericValues.length);
                const labels = new Array(nbPoints);
                const data = new Array(nbPoints);
                for (let i = 0; i < nbPoints; i++) {
                    labels[i] = i * samplingStep;
                    data[i] = this.data.values.numericValues[i * samplingStep];
                }
                if (this.data.values.numericValues.length > 1000) {
                    labels[sampling] = this.data.values.numericValues.length;
                    data[sampling] = this.data.values.numericValues[this.data.values.numericValues.length - 1];
                }

                return {
                    labels: labels,
                    datasets: [{
                        label: this.attributeName,
                        //backgroundColor: '#f53794',
                        borderColor: '#f53794',
                        data: data,
                        fill: true,
                    }],
                }
            }
        }
    }
</script>
