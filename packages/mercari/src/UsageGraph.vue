<template>
    <line-chart
        :chart-data="chart.data"
        :options="chart.options"
        :height="chart.height"
        class="w-full relative"
    />
</template>

<script>
    import LineChart from "common/components/explorer/analysis/LineChart";

    export default {
        name: 'UsageGraph',
        props: ['metricName', 'metricValues', 'config'],
        components: {LineChart},
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
                const labels = new Array(this.metricValues.length);
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Nov', 'Dev'];

                for(let i = 0; i < this.metricValues.length; i++) {
                    const date = new Date(this.metricValues[i].t);

                    if (this.config.usagePeriod === 'day') {
                        labels[i] = `${date.getHours()}:${(date.getMinutes() < 10 ? '0':'') + date.getMinutes()}`;
                    } else {
                        labels[i] = `${months[date.getMonth()]} ${date.getDay()}`;
                    }
                }

                const points = new Array(this.metricValues.length);
                for(let i = 0; i < this.metricValues.length; i++){
                    points[i] = this.metricValues[i].v;
                }

                return {
                    labels: labels,
                    datasets: [{
                        label: this.metricName,
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: points,
                        fill: false,
                        borderWidth: 2,
                        pointBorderWidth: 0,
                        steppedLine: true,
                        pointRadius: 0,
                    }]
                }
            },
            chartOption: function () {
                return {
                    maintainAspectRatio: false,
                    position: 'left',
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        labels: {
                            boxWidth: 0,
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: undefined,
                                max: undefined,
                                precision: undefined,
                                callback: (value) => {
                                    return value;
                                },
                                fontSize: 10,
                            },
                            /*afterFit: function(scale) {
                                scale.width = 120;
                            },*/
                        }],
                        xAxes: [{
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
