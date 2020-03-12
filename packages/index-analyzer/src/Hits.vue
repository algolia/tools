<template>
    <div>
        <attributes
            :top-attributes="['objectID', attributeParts[0]]"
            :no-collapse="true"
            class="w-full"
            :item="hitsTransformer.transformObj(hits[page])._v_"
        />
        <pagination
            @onUpdatePage="page = $event"
            :page="page"
            :nb-pages="hits.length"
        />
    </div>
</template>

<script>
    import Attributes from "common/components/explorer/hits/Attributes";
    import HitsTransformer from "common/components/explorer/hits/hitsTransformer";
    import Pagination from "common/components/explorer/results/Pagination";

    export default {
        name: 'Hits',
        props: ['hits', 'attributeParts'],
        components: {Attributes, Pagination},
        data: function () {
            return {
                page: 0,
                hitsTransformer: new HitsTransformer(),
            }
        },
        watch: {
            hits: function () {
                this.page = 0;
            }
        }
    }
</script>
