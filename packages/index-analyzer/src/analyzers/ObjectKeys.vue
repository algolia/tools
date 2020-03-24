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
                <td class="py-8"></td>
                <td class="uppercase tracking-wide text-xs p-8">
                    <download-icon class="w-12 h-12 cursor-pointer" @click="exportTableToCSV()"/>
                </td>
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
                        </div>
                    </template>
                </td>
                <td class="py-8">
                    <template v-if="data.object.typesPerAttribute[key]">
                        <div v-for="type in data.object.typesPerAttribute[key].sortedTypes">
                            <span>({{percent(data.object.typesPerAttribute[key].type[type], data.matchingNbHits)}})</span><br>
                        </div>
                    </template>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import {downloadCsv, percent} from "../helpers";
    import {highlightStringBaseOnQuery} from "common/utils/formatters";
    import DownloadIcon from "common/icons/download.svg";

    export default {
        name: 'ObjectKeys',
        props: ['data', 'attributeName', 'attributes', 'appId', 'indexName'],
        components: {DownloadIcon},
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
        },
        methods: {
            exportTableToCSV: function () {
                const rows = [
                    ['Key', 'Count', '%', 'Present in settings', 'Types', ''],
                    ...this.filteredKeys.map((key) => [
                        key,
                        this.data.object.keysUniqueWithCount[key],
                        percent(this.data.object.keysUniqueWithCount[key], this.data.type.object),

                        this.attributes[`${this.attributeName}${this.attributeName.length > 0 ? '.': ''}${key}`] ?
                        this.attributes[`${this.attributeName}${this.attributeName.length > 0 ? '.': ''}${key}`].map((attribute) => {
                            return `${attribute.settings}[${attribute.position}]`;
                        }).join("\n")
                        : '',

                        this.data.object.typesPerAttribute[key].sortedTypes.map((type) => type).join("\n"),
                        this.data.object.typesPerAttribute[key].sortedTypes.map((type) => {
                            return percent(this.data.object.typesPerAttribute[key].type[type], this.data.matchingNbHits);
                        }).join("\n"),
                    ]),
                ];

                downloadCsv(rows, `${this.appId}.${this.indexName}.${this.attributeName}.types.xls`);
            }
        }
    }
</script>
