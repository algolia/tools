<template>
    <div v-if="data.type.numeric">
        <h2 class="my-24">Numeric values</h2>
        <table>
            <tr
                v-for="metric in ['min', 'max', 'mean', 'p1', 'p25', 'median', 'p75', 'p99']"
                class="border-t border-proton-grey-opacity-30"
            >
                <td class="p-8">{{metric}}</td>
                <td class="p-8">{{data.numerics[metric]}}</td>
            </tr>
        </table>
        <distribution-chart :data="data" :attribute-name="name" />
    </div>
</template>

<script>
    import DistributionChart from "./DistributionChart";

    export default {
        name: 'NumericValues',
        props: ['data', 'name'],
        components: {DistributionChart}
    }
</script>
