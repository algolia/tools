<template>
    <div v-if="data.type.numeric">
        <h2 class="my-24">Numeric values</h2>
        <div class="flex">
            <values-list
                :data="data"
                count-key="numericUniqueValueWithCount"
                :value-filter="valueFilter"
                :app-id="appId"
                :index-name="indexName"
                :attribute-name="attributeName"
                v-on="$listeners"
            />
            <div class="ml-48" v-if="!valueFilter" style="margin-top: 42px;">
                <table>
                    <tr>
                        <td class="uppercase tracking-wide text-xs p-8">Metric</td>
                        <td class="uppercase tracking-wide text-xs p-8">Value</td>
                    </tr>
                    <tr
                        v-for="metric in ['min', 'max', 'mean', 'p1', 'p25', 'median', 'p75', 'p99']"
                        class="border-t border-proton-grey-opacity-30"
                    >
                        <td class="p-8">{{metric}}</td>
                        <td class="p-8">{{data.numerics[metric]}}</td>
                    </tr>
                </table>
            </div>
        </div>
        <distribution-chart v-if="!valueFilter" :data="data" :attribute-name="attributeName" />
    </div>
</template>

<script>
    import DistributionChart from "./DistributionChart";
    import ValuesList from "./ValuesList";

    export default {
        name: 'NumericValues',
        props: ['data', 'attributeName', 'valueFilter', 'appId', 'indexName'],
        components: {ValuesList, DistributionChart}
    }
</script>
