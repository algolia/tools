<template>
    <div v-if="Object.keys(data.values.stringUniqueValuesWithCount).length > 0">
        <h2 class="my-24">String Values</h2>
        <div class="flex">
            <values-list
                :data="data"
                count-key="stringUniqueValuesWithCount"
                :value-filter="valueFilter"
                v-on="$listeners"
            />
            <div class="ml-48">
                <table>
                    <tr>
                        <td class="uppercase tracking-wide text-xs p-8">Metric</td>
                        <td class="uppercase tracking-wide text-xs p-8">Value</td>
                    </tr>
                    <tr class="border-t border-proton-grey-opacity-30">
                        <td class="p-8">Average count</td>
                        <td class="p-8">{{data.values.averageStringCountValues}}</td>
                    </tr>
                    <tr class="border-t border-proton-grey-opacity-30">
                        <td class="p-8">Average length</td>
                        <td class="p-8">{{data.values.averageLength}}</td>
                    </tr>
                    <tr class="border-t border-proton-grey-opacity-30">
                        <td class="p-8">Average nbWords</td>
                        <td class="p-8">{{data.values.averageNbWords}}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    import ValuesList from "./ValuesList";

    export default {
        name: 'StringValues',
        props: ['data', 'valueFilter', 'typeFilter'],
        components: {ValuesList},
    }
</script>
