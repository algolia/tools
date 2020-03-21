<template>
    <div v-if="attributeName.length > 0">
        <h2 class="mb-24">Types</h2>
        <table>
            <tr>
                <td class="uppercase tracking-wide text-xs p-8">Type</td>
                <td class="uppercase tracking-wide text-xs p-8">Count</td>
                <td class="uppercase tracking-wide text-xs p-8">%</td>
            </tr>
            <tr
                v-for="type in data.sortedTypes"
                class="border-t border-proton-grey-opacity-30"
            >
                <td class="p-8">
                    <span
                        v-if="typeFilter.length === 0"
                        class="cursor-pointer text-nebula-blue hover:underline"
                        @click="$emit('onUpdateTypeFilter', type)"
                    >
                        {{type}}
                    </span>
                    <span v-else>{{type}}</span>
                </td>
                <td class="p-8">{{data.type[type]}}</td>
                <td class="p-8">{{percent(data.type[type], data.matchingNbHits)}}</td>
            </tr>
        </table>
    </div>
</template>

<script>
    import {percent} from "../helpers";

    export default {
        name: 'types',
        props: ['data', 'typeFilter', 'attributeName'],
        data: function () {
            return {
                percent: percent,
            }
        }
    }
</script>
