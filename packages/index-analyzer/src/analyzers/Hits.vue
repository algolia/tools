<template>
    <div v-if="data.recordsMatching.length > 0">
        <h2 class="py-24">First 10 hits</h2>
        <div>
            <attributes
                :top-attributes="['objectID', attributeParts[0]]"
                :no-collapse="true"
                class="w-full"
                :item="hitsTransformer.transformObj(data.recordsMatching[page])._v_"
            />
            <pagination
                @onUpdatePage="page = $event"
                :page="page"
                :nb-pages="data.recordsMatching.length"
            />
        </div>
    </div>
</template>

<script>
    import Attributes from "common/components/explorer/hits/Attributes";
    import HitsTransformer from "common/components/explorer/hits/hitsTransformer";
    import Pagination from "common/components/explorer/results/Pagination";

    export default {
        name: 'Hits',
        props: ['data', 'attributeParts'],
        components: {Attributes, Pagination},
        data: function () {
            return {
                page: 0,
                hitsTransformer: new HitsTransformer(),
            }
        },
        watch: {
            data: function () {
                this.page = 0;
            }
        }
    }
</script>
