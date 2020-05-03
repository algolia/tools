<template>
    <div>
        <h2 class="text-center mb-24">{{app.application_id}} <span v-if="app.name">- {{app.name}}</span></h2>
        <div class="flex">
            <table class="w-full">
                <tr class="border-b border-proton-grey-opacity-40">
                    <td class="p-8 align-top">Name</td>
                    <td class="p-8 align-top">nbRecords</td>
                    <td class="p-8 align-top">dataSize</td>
                    <td class="p-8 align-top">fileSize</td>
                    <td class="p-8 align-top">nbShards</td>
                    <td class="p-8 align-top">Usage</td>
                </tr>
                <tr class="border-b border-proton-grey-opacity-40" v-for="(index, indexPos) in indices">
                    <td class="p-8 align-top">{{index.name}}</td>
                    <td class="p-8 align-top">{{formatHumanNumber(index.entries)}}</td>
                    <td class="p-8 align-top">{{formatHumanNumber(index.dataSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                    <td class="p-8 align-top">{{formatHumanNumber(index.fileSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                    <td class="p-8 align-top"><span v-if="index.settings">{{index.settings.nbShards}}</span></td>
                    <td class="p-8 align-top" :rowspan="config.usage.detailsPerIndex ? 1 : indices.length">
                        <div v-if="index.usage">
                            <div v-for="graph in config.usage.enabledGraphs">
                                <usage-graph
                                    v-if="config.usage.detailsPerIndex"
                                    :graph="graph"
                                    :metrics="index.usage"
                                    :config="config"
                                    chart-type="bar"
                                    :stacked="true"
                                />
                                <usage-graph
                                    v-if="indexPos === 0 && config.usage.detailsPerIndex === false"
                                    :graph="{name: graph.name, metrics: Object.keys(aggregatedUsage[graph.name])}"
                                    :metrics="aggregatedUsage[graph.name]"
                                    :config="config"
                                    chart-type="bar"
                                    :height="400"
                                    :stacked="false"
                                />
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    import {formatHumanNumber} from "common/utils/formatters";
    import UsageGraph from "./UsageGraph";

    export default {
        name: 'Indices',
        components: {UsageGraph},
        props: ['app', 'config'],
        data: function () {
            return {
                formatHumanNumber,
            }
        },
        computed: {
            indices: function () {
                const indices = this.app.indices || {};
                const names = Object.keys(indices).sort((a, b) => this.app.indices[b].fileSize - this.app.indices[a].fileSize);
                return names.map((name) => this.app.indices[name]);
            },
            aggregatedUsage: function () {
                const aggregatedUsage = {};
                this.config.usage.enabledGraphs.forEach((graph) => {
                    if (aggregatedUsage[graph.name] === undefined) aggregatedUsage[graph.name] = {};
                    this.indices.forEach((index) => {
                        if (!index.usage) return;
                        graph.metrics.forEach((metric, i) => {
                            if (!index.usage[metric]) return
                            if (aggregatedUsage[graph.name][index.name] === undefined) {
                                aggregatedUsage[graph.name][index.name] = index.usage[metric];
                            }
                            else {
                                index.usage[metric].forEach((timeserie, j) => {
                                    aggregatedUsage[graph.name][index.name][j].v += timeserie.v;
                                });
                            }
                        });
                    });
                });

                return aggregatedUsage;
            }
        }
    }
</script>
