<template>
    <div>
        <table>
            <tr>
                <td class="uppercase tracking-wide text-xs p-8">value</td>
                <td class="uppercase tracking-wide text-xs p-8">Count</td>
            </tr>
            <tr v-for="k in paginatedValues" class="border-t border-proton-grey-opacity-30">
                <td class="p-8">
                    <span
                        v-if="valueFilter === null"
                        class="cursor-pointer text-nebula-blue hover:underline"
                        @click="$emit('onUpdateAttributeName', `${name}:${type}:${k}`)"
                    >
                        {{k.length > 0 ? k : '&lt;empty&gt;'}}
                    </span>
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

    export default {
        name: 'ValuesList',
        props: ['data', 'countKey', 'valueFilter', 'name', 'type'],
        components: {Pagination},
        data: function () {
            return {
                hitsPerPage: 10,
                page: 0,
            }
        },
        computed: {
            values: function () {
                const values = Object.keys(this.data.values[this.countKey]);
                values.sort((a, b) => this.data.values[this.countKey][b] - this.data.values[this.countKey][a]);
                return values;
            },
            paginatedValues: function () {
                return this.values.slice(this.page * this.hitsPerPage, (this.page + 1) * this.hitsPerPage);
            }
        },
    }
</script>
