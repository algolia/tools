<template>
    <div v-if="data.type.object">
        <h2 v-if="attributeName.length > 0" class="my-24">Object keys</h2>
        <input
            class="px-8 py-4 bg-white rounded border border-proton-grey-opacity-80 bg-transparent text-telluric-blue"
            placeholder="Filter keys"
            v-model="query"
        />
        <table class="mt-16">
            <tr>
                <td class="uppercase tracking-wide text-xs p-8">Key</td>
                <td class="uppercase tracking-wide text-xs p-8">Count</td>
                <td class="uppercase tracking-wide text-xs p-8">%</td>
                <td class="uppercase tracking-wide text-xs p-8">Present in settings</td>
                <td class="uppercase tracking-wide text-xs p-8">Types</td>
            </tr>
            <tr
                v-for="key in filteredKeys"
                class="border-t border-proton-grey-opacity-30 align-top"
            >
                <td class="p-8">
                    <span
                        class="hit link cursor-pointer text-nebula-blue hover:underline"
                        @click="$emit('onUpdateAttributeName', `${attributeName}${attributeName.length > 0 ? '.': ''}${key}`)"
                        v-html="highlightStringBaseOnQuery(key, query)"
                    ></span>
                </td>
                <td class="p-8">{{data.object.keysUniqueWithCount[key]}}</td>
                <td class="p-8">{{percent(data.object.keysUniqueWithCount[key], data.type.object)}}</td>
                <td class="p-8">
                    <template v-if="attributes[`${attributeName}${attributeName.length > 0 ? '.': ''}${key}`]">
                        <div v-for="attribute in attributes[`${attributeName}${attributeName.length > 0 ? '.': ''}${key}`]">
                            {{attribute.settings}}<span v-if="attribute.position !== undefined">[{{attribute.position}}]</span>
                        </div>
                    </template>
                </td>
                <td class="p-8">
                    <template v-if="data.object.typesPerAttribute[key]">
                        <div v-for="type in data.object.typesPerAttribute[key].sortedTypes">
                            <span
                                class="cursor-pointer text-nebula-blue hover:underline"
                                @click="$emit('onUpdateAttributeName', `${attributeName}${attributeName.length > 0 ? '.': ''}${key}`); $emit('onUpdateTypeFilter', type)"
                            >{{type}}</span>
                            <span>&nbsp;{{percent(data.object.typesPerAttribute[key].type[type], data.matchingNbHits)}}</span>
                        </div>
                    </template>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import {percent} from "../helpers";
    import {highlightStringBaseOnQuery} from "common/utils/formatters";

    export default {
        name: 'ObjectKeys',
        props: ['data', 'attributeName', 'attributes'],
        data: function () {
            return {
                query: '',
                percent: percent,
                highlightStringBaseOnQuery: highlightStringBaseOnQuery,
            }
        },
        computed: {
            filteredKeys: function () {
                const query = this.query.toLowerCase();
                return this.data.object.sortedKeys.filter((key) => {
                    return key.toLowerCase().includes(query);
                });
            }
        }
    }
</script>
