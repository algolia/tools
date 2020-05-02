<template>
    <div>
        <h2 class="text-center mb-24">Indices: {{app.application_id}} - {{app.name}}</h2>
        <div class="flex">
            <div class="bg-white rounded border border-proton-grey-opacity-60 mx-auto">
                <table>
                    <tr class="border-b border-proton-grey-opacity-40">
                        <td class="p-8 align-top">Name</td>
                        <td class="p-8 align-top">nbRecords</td>
                        <td class="p-8 align-top">dataSize</td>
                        <td class="p-8 align-top">fileSize</td>
                        <td class="p-8 align-top">nbShards</td>
                        <td class="p-8 align-top">graphs</td>
                    </tr>
                    <tr class="border-b border-proton-grey-opacity-40" v-for="index in indices">
                        <td class="p-8 align-top">{{index.name}}</td>
                        <td class="p-8 align-top">{{formatHumanNumber(index.entries)}}</td>
                        <td class="p-8 align-top">{{formatHumanNumber(index.dataSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                        <td class="p-8 align-top">{{formatHumanNumber(index.fileSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                        <td class="p-8 align-top"><span v-if="index.settings">{{index.settings.nbShards}}</span></td>
                        <td class="p-8 align-top">
                            <div v-if="index.usage">
                                <div v-for="metricName in Object.keys(index.usage)">
                                    <usage-graph
                                        :metric-name="metricName"
                                        :metric-values="index.usage[metricName]"
                                        :config="config"
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
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
                const names = Object.keys(this.app.indices).sort((a, b) => this.app.indices[b].fileSize - this.app.indices[a].fileSize);
                return names.map((name) => this.app.indices[name]);
            }
        }
    }
</script>
