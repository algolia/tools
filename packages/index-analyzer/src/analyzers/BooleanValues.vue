<template>
    <div v-if="data.type.boolean">
        <h2 class="my-24">Boolean values</h2>
        <table>
            <tr>
                <td class="uppercase tracking-wide text-xs p-8">Value</td>
                <td class="uppercase tracking-wide text-xs p-8">Count</td>
                <td class="uppercase tracking-wide text-xs p-8">%</td>
            </tr>
            <tr class="border-t border-proton-grey-opacity-30">
                <td class="p-8">True</td>
                <td class="p-8">{{data.boolean.true}}</td>
                <td class="p-8">{{percent(data.boolean.true, data.type.boolean)}}</td>
            </tr>
            <tr class="border-t border-proton-grey-opacity-30">
                <td class="p-8">False</td>
                <td class="p-8">{{data.boolean.false}}</td>
                <td class="p-8">{{percent(data.boolean.false, data.type.boolean)}}</td>
            </tr>
        </table>
    </div>
</template>

<script>
    import {percent} from "../helpers";

    export default {
        name: 'BooleanValues',
        props: ['data'],
        data: function () {
            return {
                percent: percent,
            }
        }
    }
</script>
