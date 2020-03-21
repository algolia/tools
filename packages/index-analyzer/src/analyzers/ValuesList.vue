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
            </tr>
            <tr v-for="k in paginatedValues" class="border-t border-proton-grey-opacity-30">
                <td class="p-8">
                    <span
                        v-if="valueFilter === null"
                        class="hit link cursor-pointer text-nebula-blue hover:underline"
                        @click="$emit('onUpdateAttributeName', `${name}:${type}:${k.length > 0 ? k : '&lt;empty&gt;'}`)"
                        v-html="k.length > 0 ? highlightStringBaseOnQuery(k, query) : '&lt;empty&gt;'"
                    ></span>
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

    export default {
        name: 'ValuesList',
        props: ['data', 'countKey', 'valueFilter', 'name', 'type'],
        components: {Pagination},
        data: function () {
            return {
                hitsPerPage: 10,
                page: 0,
                emptyQuery: JSON.stringify(''),
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
    }
</script>
