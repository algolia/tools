<template>
    <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8">
        <attributes :top-attributes="[]" :item="hitsTransformer.transformObj(searchResponse)._v_" />
    </div>
</template>

<script>
    import Attributes from "../hits/Attributes";
    import HitsTransformer from "../hits/hitsTransformer";

    export default {
        name: 'RawResponse',
        components: {Attributes},
        props: ['searchResponse'],
        data: function () {
            return {
                hitsTransformer: new HitsTransformer(),
            };
        }
    }
</script>