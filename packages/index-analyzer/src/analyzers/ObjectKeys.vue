<template>
    <div v-if="data.type.object">
        <h2 v-if="name.length > 0" class="my-24">Object keys</h2>
        <table>
            <tr>
                <td class="uppercase tracking-wide text-xs p-8">Key</td>
                <td class="uppercase tracking-wide text-xs p-8">Count</td>
                <td class="uppercase tracking-wide text-xs p-8">%</td>
            </tr>
            <tr
                v-for="key in data.object.sortedKeys"
                class="border-t border-proton-grey-opacity-30 align-top"
            >
                <td class="p-8">
                <span
                    class="cursor-pointer text-nebula-blue hover:underline"
                    @click="$emit('onUpdateAttributeName', `${name}${name.length > 0 ? '.': ''}${key}`)"
                >
                    {{key}}
                </span>
                </td>
                <td class="p-8">{{data.object.keysUniqueWithCount[key]}}</td>
                <td class="p-8">{{percent(data.object.keysUniqueWithCount[key], data.type.object)}}</td>
                <td class="p-8">
                    <template v-if="attributes[`${name}${name.length > 0 ? '.': ''}${key}`]">
                        <div v-for="attribute in attributes[`${name}${name.length > 0 ? '.': ''}${key}`]">
                            {{attribute.settings}}<span v-if="attribute.position !== undefined">[{{attribute.position}}]</span>
                        </div>
                    </template>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import {percent} from "../helpers";

    export default {
        name: 'ObjectKeys',
        props: ['data', 'name', 'attributes'],
        data: function () {
            return {
                percent: percent,
            }
        }
    }
</script>
