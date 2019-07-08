<template>
    <div class="ml-24" v-if="!$store.state.panels.splitMode">
        <div v-for="attribute in attributesForFaceting" class="bg-white">
            <div class="text-center">{{cleanAttributeName(attribute)}}</div>
            <ais-refinement-list
                    :limit="searchParams.maxValuesPerFacet || 10"
                    :attribute="cleanAttributeName(attribute)"
                    :searchable="attribute !== cleanAttributeName(attribute)"
            />
        </div>
    </div>
</template>

<script>
    import {cleanAttributeName} from 'common/utils/formatters'
    import indexInfoMixin from "@/mixins/indexInfoMixin";

    export default {
        name: 'Facets',
        props: ['attributesForFaceting', 'panelKey'],
        mixins: [indexInfoMixin],
        methods: {
            cleanAttributeName,
        }
    }
</script>