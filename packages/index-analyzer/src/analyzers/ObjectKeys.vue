<template>
    <div v-if="data.type.object">
        <h2 v-if="name.length > 0" class="my-24">Object keys</h2>
        <tr
            v-for="key in data.object.sortedKeys"
            class="border-t border-proton-grey-opacity-30"
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
        </tr>
    </div>
</template>

<script>
    import {percent} from "../helpers";

    export default {
        name: 'ObjectKeys',
        props: ['data', 'name'],
        data: function () {
            return {
                percent: percent,
            }
        }
    }
</script>
