<template>
    <div>
        <input
            class="px-8 py-4 bg-white rounded border border-proton-grey-opacity-80 bg-transparent text-telluric-blue"
            placeholder="Filter values"
            v-model="query"
        />
        <table class="mt-16">
            <tr>
                <td class="uppercase tracking-wide text-xs p-8">value</td>
                <td class="uppercase tracking-wide text-xs p-8">Count</td>
                <td class="uppercase tracking-wide text-xs p-8">
                    <download-icon class="w-12 h-12 cursor-pointer" @click="exportTableToCSV()"/>
                </td>
            </tr>
            <tr v-for="k in paginatedValues" class="border-t border-proton-grey-opacity-30">
                <td class="p-8">
                    <span
                        v-if="valueFilter.length === 0 && k.length > 0"
                        class="hit link cursor-pointer text-nebula-blue hover:underline"
                        @click="$emit('onUpdateValueFilter', `${k.length > 0 ? k : '&lt;empty&gt;'}`)"
                        v-html="highlightStringBaseOnQuery(k, query)"
                    ></span>
                    <span
                        v-else-if="valueFilter.length === 0"
                        @click="$emit('onUpdateValueFilter', '&lt;empty&gt;')"
                        class="hit link cursor-pointer text-nebula-blue hover:underline"
                    >&lt;empty&gt;</span>
                    <span v-else>{{k.length > 0 ? k : '&lt;empty&gt;'}}</span>
                </td>
                <td class="p-8">
                    {{data.values[countKey][k]}}
                </td>
            </tr>
        </table>
        <pagination
            @onUpdatePage="page = $event"
            :page="page"
            :nb-pages="Math.ceil(values.length / hitsPerPage)"
        />
    </div>
</template>

<script>
    import Pagination from "common/components/explorer/results/Pagination";
    import {highlightStringBaseOnQuery} from "common/utils/formatters";
    import {downloadCsv, percent} from "../helpers";
    import DownloadIcon from "common/icons/download.svg";

    export default {
        name: 'ValuesList',
        props: ['data', 'countKey', 'valueFilter', 'appId', 'indexName', 'attributeName'],
        components: {Pagination, DownloadIcon},
        data: function () {
            return {
                hitsPerPage: 10,
                page: 0,
                query: '',
                highlightStringBaseOnQuery: highlightStringBaseOnQuery,
            }
        },
        computed: {
            values: function () {
                let values = Object.keys(this.data.values[this.countKey]);
                if (this.query.length) {
                    const query = this.query.toLowerCase();
                    values = values.filter((v) => {
                        return v.toString().toLowerCase().includes(query);
                    });
                }
                values.sort((a, b) => this.data.values[this.countKey][b] - this.data.values[this.countKey][a]);
                return values;
            },
            paginatedValues: function () {
                return this.values.slice(this.page * this.hitsPerPage, (this.page + 1) * this.hitsPerPage);
            }
        },
        methods: {
            exportTableToCSV: function () {
                const rows = [
                    ['Value', 'Count'],
                    ...this.values.map((key) => [
                        key,
                        this.data.values[this.countKey][key]
                    ]),
                ];

                downloadCsv(rows, `${this.appId}.${this.indexName}.${this.attributeName}.values.xls`);
            }
        }
    }
</script>
