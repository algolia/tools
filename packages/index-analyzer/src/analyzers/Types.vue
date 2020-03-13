<template>
    <div v-if="name.length > 0">
        <h2 class="mb-24">Types</h2>
        <table>
            <tr
                v-for="type in data.sortedTypes"
                class="border-t border-proton-grey-opacity-30"
            >
                <td class="p-8">
                            <span
                                v-if="typeFilter === null"
                                class="cursor-pointer text-nebula-blue hover:underline"
                                @click="$emit('onUpdateAttributeName', `${name}:${type}`)"
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
        props: ['data', 'typeFilter', 'name'],
        data: function () {
            return {
                percent: percent,
            }
        }
    }
</script>
