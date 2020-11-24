<template>
    <div class="w-full">
        <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8">
            <div>
                Nb of points : <input type="number" v-model="nbPoints" min="1" style="width: 50px;"/>
            </div>

            <div class="flex mt-12">
                <div class="cursor-pointer mr-12" @click="setAllCriteria(true)">Select All</div>
                <div class="cursor-pointer" @click="setAllCriteria(false)">Unselect All</div>
            </div>

            <div class="flex flex-wrap mt-4">
                <div v-for="chart in charts" class="mr-12">
                    <input
                            :checked="criteriaStatus[chart.criterion]"
                            type="checkbox"
                            v-on:input="setCriterionStatus(chart.criterion, $event.target.checked)"
                    />
                    {{chart.criterion}}
                </div>
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
    import LineChart from "./LineChart";
    import RankingInfoAnalyser from "../hits/rankingInfoAnalyser"

    export default {
        name: 'RankingCharts',
        components: {LineChart},
        props: ['analyseResponse', 'indexSettings', 'searchParams', 'analyseMaxNbPoints', 'weights'],
        data: function () {
            return {
                criteriaStatus: {},
                forceUpdateInteger: 0
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
            hits: function () {
                return this.analyseResponse ? this.analyseResponse.hits : [];
            },
            nbPoints: {
                get () {
                    return this.analyseMaxNbPoints;
                },
                set (val) {
                    this.$emit('onUpdateAnalyseMaxNbPoint', val)
                }
            },
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.indexSettings, this.weights);
            },
            criteria: function () {
                return [
                    ...this.rankingInfoAnalyzer.getActualCriteria(this.searchParams),
                    ...(this.searchParams.extraChartsAttributes || []),
                ];
            },
            searchableAttributes: function () {
                return this.indexSettings.searchableAttributes || this.indexSettings.attributesToIndex || [];
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
            annotation: function () {
                const annotations = [];

                this.hits.forEach((hit, i) => {
                    if (hit._rankingInfo.startsRelevanceBucket) {
                        annotations.push({
                            drawTime: 'beforeDatasetsDraw',
                            type: "line",
                            mode: "vertical",
                            scaleID: "x-axis-0",
                            value: i + 1,
                            borderColor: "rgba(0,0,0,0.1)",
                            borderWidth: 1,
                        });
                    }
                });

                return {
                    annotations: annotations,
                }
            },
        },
        methods: {
            setAllCriteria: function (val) {
                this.criteria.forEach((criterion) => {
                    this.$set(this.criteriaStatus, criterion, val);
                });
            },
            setCriterionStatus: function (criterion, val) {
                this.$set(this.criteriaStatus, criterion, val);
            },
            updateCriteriaStatus: function () {
                this.criteriaStatus = {};

                this.criteria.forEach((criterion) => {
                    this.$set(this.criteriaStatus, criterion, true);
                });
            },
            chartOption: function (criterion) {
                return {
                    maintainAspectRatio: false,
                    position: 'left',
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: (tooltipItems, data) => {
                                let title = '';
                                const labels = data.labels;
                                const labelCount = labels ? labels.length : 0;

                                if (tooltipItems.length > 0) {
                                    const item = tooltipItems[0];
                                    if (item.label) {
                                        title = item.label;
                                    } else if (item.xLabel) {
                                        title = item.xLabel;
                                    } else if (labelCount > 0 && item.index < labelCount) {
                                        title = labels[item.index];
                                    }

                                    if (this.hits[item.index]._rankingInfo.promoted) {
                                        title = `${title} [promoted]`
                                    }

                                    if (this.hits[item.index]._rankingInfo.personalization && this.hits[item.index]._rankingInfo.personalization.filtersScore > 0) {
                                        title = `${title} [personalized]`
                                    }
                                }

                                return title;
                            },
                        },
                    },
                    legend: {
                        labels: {
                            boxWidth: 0,
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: ['similarity', 'typo', 'words', 'proximity', 'attribute', 'position', 'exact', 'filters', 'perso.rankingScore', 'perso.filtersScore'].indexOf(criterion) !== -1,
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
                                scale.width = 120;
                            },
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
                    annotation: this.annotation,
                }
            },
            chartData: function (criterion) {
                const labels = new Array(this.hits.length);
                for(let i = 0; i < this.hits.length; i++) labels[i] = i + 1;

                const points = new Array(this.hits.length);
                for(let i = 0; i < this.hits.length; i++){
                    points[i] = this.rankingInfoAnalyzer.getCriterionValue(this.hits[i], criterion, this.hits[0], this.searchParams);

                    if (criterion === 'attribute') {
                        points[i] = this.searchableAttributes.length - 1 - points[i];
                    }
                }

                let labelCriterion = criterion;
                if (['perso.filtersScore', 'perso.rankingScore'].indexOf(criterion) !== -1) {
                    labelCriterion = criterion + ' (for perso debugging only)'
                }

                return {
                    labels: labels,
                    datasets: [{
                        label: labelCriterion,
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
