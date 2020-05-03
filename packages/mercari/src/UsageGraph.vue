<template>
    <bar-chart
        :chart-data="chart.data"
        :options="chart.options"
        :height="chart.height"
        class="w-full relative"
    />
</template>

<script>
    import BarChart from "common/components/explorer/analysis/BarChart";
    import {formatHumanNumber} from "common/utils/formatters";

    export default {
        name: 'UsageGraph',
        props: ['graph', 'metrics', 'config'],
        components: {BarChart},
        computed: {
            chart: function () {
                return {
                    enabled: true,
                    height: 154,
                    data: this.chartData,
                    options: this.chartOption,
                };
            },
            chartData: function () {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const colors = [
                    'rgb(54, 162, 235)',
                    'rgb(75, 192, 192)',
                    'rgb(61,231,27)',
                    'rgb(255, 159, 64)',
                    'rgb(153, 102, 255)',
                    'rgb(255, 99, 132)',
                    'rgb(255, 205, 86)',
                ]

                const firstMetric = this.graph.metrics[0];
                if (!this.metrics[firstMetric]) return {labels: [], datasets: []};

                const sampleRate = Math.max(1, Math.floor(this.metrics[firstMetric].length / 31));
                const nbPoints = Math.min(this.metrics[firstMetric].length, 31);

                const labels = new Array(nbPoints);
                for(let i = 0; i < nbPoints; i++) {
                    const date = new Date(this.metrics[firstMetric][sampleRate * i].t);

                    if (this.config.usage.period === 'day') {
                        labels[i] = `${date.getHours()}:${(date.getMinutes() < 10 ? '0':'') + date.getMinutes()}`;
                    } else {
                        labels[i] = `${months[date.getMonth()]} ${date.getDate() + 1}`;
                    }
                }

                const datasets = this.graph.metrics.map((metric, metricPos) => {
                    const points = new Array(nbPoints);
                    for(let i = 0; i < nbPoints; i++){
                        points[i] = this.metrics[metric][sampleRate * i].v;
                    }

                    return {
                        label: metric,
                        backgroundColor: colors[metricPos % colors.length],
                        borderColor: colors[metricPos % colors.length],
                        data: points,
                        fill: false,
                        borderWidth: 2,
                        pointBorderWidth: 0,
                        steppedLine: true,
                        pointRadius: 0,
                    }
                });

                return {
                    labels: labels,
                    datasets: datasets
                }
            },
            chartOption: function () {
                return {
                    maintainAspectRatio: false,
                    position: 'left',
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (tooltipItem, data) => {
                                return `${this.graph.metrics[tooltipItem.datasetIndex]}: ${formatHumanNumber(tooltipItem.yLabel)}`;
                            },
                        },
                    },
                    legend: {
                        display: false,
                        labels: {
                            boxWidth: 0,
                        }
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                beginAtZero: true,
                                stepSize: undefined,
                                max: undefined,
                                precision: 0,
                                callback: (value) => {
                                    return formatHumanNumber(value);
                                },
                                fontSize: 10,
                            },
                            /*afterFit: function(scale) {
                                scale.width = 120;
                            },*/
                        }],
                        xAxes: [{
                            stacked: true,
                            ticks: {
                                fontSize: 10,
                            },
                            gridLines: {
                                display: false
                            }
                        }],
                    },
                }
            },
        }
    }
</script>
