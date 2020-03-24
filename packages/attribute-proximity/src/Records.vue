<template>
    <div>
        <div v-for="record in records" class="hit bg-white mr-16 mt-16 p-16 rounded">
            <attributes
                :top-attributes="['objectID', ...searchableAttributes]"
                :no-collapse="true"
                class="w-full"
                :search-params="{}"
                :item="hitsTransformer.transformObj(record)._v_"
            />
        </div>
    </div>
</template>

<script>
    import hitsTransformer from "common/components/explorer/hits/hitsTransformer";
    import Attributes from "common/components/explorer/hits/Attributes";

    export default {
        name: 'Records',
        props: ['records', 'searchableAttributes'],
        components: {Attributes},
        data: function () {
            return {
                hitsTransformer: new hitsTransformer(),
            }
        }
    }
</script>
