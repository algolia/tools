<template>
    <div>
        <table>
            <tr v-for="k in paginatedValues" class="border-t border-proton-grey-opacity-30">
                <td class="p-8">
                    {{k}}
                </td>
                <td class="p-8">
                    {{data.values.stringUniqueValuesWithCount[k]}}
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
        props: ['data'],
        components: {Pagination},
        data: function () {
            return {
                values: [],
                hitsPerPage: 10,
                page: 0,
            }
        },
        created: function () {
            const values = Object.keys(this.data.values.stringUniqueValuesWithCount);
            values.sort((a, b) => this.data.values.stringUniqueValuesWithCount[b] - this.data.values.stringUniqueValuesWithCount[a]);
            this.values = Object.freeze(values);
        },
        computed: {
            paginatedValues: function () {
                return this.values.slice(this.page * this.hitsPerPage, (this.page + 1) * this.hitsPerPage);
            }
        },
    }
</script>
