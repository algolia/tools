<template>
    <div v-if="Object.keys(data.values.stringUniqueValuesWithCount).length > 0">
        <h2 class="my-24">String Values</h2>
        <div class="flex">
            <values-list :data="data"/>
            <div>
                <table>
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
        props: ['data'],
        components: {ValuesList},
    }
</script>
