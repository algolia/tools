<template>
    <div class="w-full">
        <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8">
            <div>
                Nb of points : <input type="number" v-model="analyseMaxNbPoints" min="1" style="width: 50px;"/>
            </div>

            <div class="flex">
                <div class="cursor-pointer mr-12" @click="setAllCriteria(true)">Select All</div>
                <div class="cursor-pointer" @click="setAllCriteria(false)">Unselect All</div>
            </div>

            <div>
                <span v-for="chart in charts">
                    <input
                            :checked="criteriaStatus[chart.criterion]"
                            type="checkbox"
                            class="ml-12"
                            v-on:input="setCriterionStatus(chart.criterion, $event.target.checked)"
                    />
                    {{chart.criterion}}
                </span>
            </div>
        </div>
        <div v-for="chart in enabledCharts" class="w-full" :key="`${chart.criterion}-${forceUpdateInteger}`">
            <line-chart
                :chart-data="chart.data"
                :options="chart.options"
                :height="chart.height"
                class="w-full relative"
            />
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import LineChart from "@/explorer/analysis/LineChart";
    import RankingInfoAnalyser from "@/explorer/hits/rankingInfoAnalyser"

    import paramsSpecs from 'common/params-specs';
    import indexInfoMixin from "@/mixins/indexInfoMixin";

    export default {
        name: 'RankingCharts',
        components: {LineChart},
        props: ['panelKey', 'hits'],
        mixins: [indexInfoMixin],
        data: function () {
            return {
                criteriaStatus: {},
                forceUpdateInteger: 0,
            }
        },
        created: function () {
            this.updateCriteriaStatus();
        },
        watch: {
            criteria: function () {
                this.updateCriteriaStatus();
            },
            charts: function () {
                this.forceUpdateInteger += 1;
            },
        },
        computed: {
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.refIndexSettings);
            },
            criteria: function () {
                return this.rankingInfoAnalyzer.getActualCriteria();
            },
            searchableAttributes: function () {
                return this.refIndexSettings.searchableAttributes || this.refIndexSettings.attributesToIndex || paramsSpecs.searchableAttributes.default;
            },
            enabledCharts: function () {
                return this.charts.filter((chart) => {
                     return chart.enabled;
                });
            },
            charts: function () {
                const charts = [];

                this.criteria.forEach((criterion) => {
                    const chart = {
                        enabled: this.criteriaStatus[criterion],
                        criterion: criterion,
                        height: criterion === 'attribute' ? 12 * this.searchableAttributes.length + 60 : 154,
                        data: this.chartData(criterion),
                        options: this.chartOption(criterion),
                    };

                    const uniqueValues = [...new Set(chart.data.datasets[0].data)];

                    if (uniqueValues.length === 1) {
                        if (criterion !== 'attribute') { // We want to display all searchable attributes in the chart even if there is no value
                            if (uniqueValues[0] === null) {
                                return;
                            }
                            if (uniqueValues[0] === 0 && criterion === 'filters') {
                                return;
                            }
                        }
                    }

                    charts.push(chart);
                });

                return charts;
            },
        },
        methods: {
            setAllCriteria: function (val) {
                this.criteria.forEach((criterion) => {
                    Vue.set(this.criteriaStatus, criterion, val);
                });
            },
            setCriterionStatus: function (criterion, val) {
                Vue.set(this.criteriaStatus, criterion, val);
            },
            updateCriteriaStatus: function () {
                this.criteriaStatus = {};
                this.criteria.forEach((criterion) => {
                    Vue.set(this.criteriaStatus, criterion, true);
                });
            },
            chartOption: function (criterion) {
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
                                beginAtZero: ['typo', 'words', 'proximity', 'attribute', 'position', 'exact', 'filters'].indexOf(criterion) !== -1,
                                stepSize: ['typo', 'words', 'proximity', 'attribute', 'exact', 'filters'].indexOf(criterion) !== -1 ? 1 : undefined,
                                max: criterion === 'attribute' ? this.searchableAttributes.length - 1 : undefined,
                                precision: criterion === 'position' ? 0 : undefined,
                                callback: (value) => {
                                    if (criterion === 'attribute') {
                                        return this.searchableAttributes[this.searchableAttributes.length - 1 - value];
                                    }
                                    return value;
                                },
                                fontSize: 10,
                            },
                            afterFit: function(scale) {
                                scale.width = 120  //<-- set value as you wish
                            },
                        }],
                        xAxes: [{
                            ticks: {
                                fontSize: 10,
                            }
                        }],
                    }
                }
            },
            chartData: function (criterion) {
                const labels = new Array(this.hits.length);
                for(let i = 0; i < this.hits.length; i++) labels[i] = i + 1;

                const points = new Array(this.hits.length);
                for(let i = 0; i < this.hits.length; i++){
                    points[i] = this.rankingInfoAnalyzer.getCriteriaValue(this.hits[i], criterion);

                    if (criterion === 'attribute') {
                        points[i] = this.searchableAttributes.length - 1 - points[i];
                    }
                }

                return {
                    labels: labels,
                    datasets: [{
                        label: criterion,
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
        }
    }
</script>