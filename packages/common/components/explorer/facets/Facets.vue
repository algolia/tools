<template>
    <div v-if="algoliaResponse && algoliaResponse.disjunctiveFacets">
        <div class="flex p-8 border-b border-proton-grey bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
            <div>
                Facets
            </div>
        </div>
        <div
            class="px-8 py-12"
        >
            <facet
                v-for="(facetValues, facetName) in algoliaResponse.disjunctiveFacets"
                :facet-name="facetName"
                :facet-values="facetValues"
                v-bind="$props"
                v-on="$listeners"
            />
        </div>
    </div>
</template>

<script>
    import Facet from "./Facet";

    export default {
        name: 'Facets',
        components: {Facet},
        props: ['panelKey', 'appId', 'indexName', 'query', 'searchParams', 'indexSettings', 'configKey'],
        data: function () {
            return {
                algoliaResponse: null,
            };
        },
        created: function () {
            this.$root.$on(`${this.panelKey}UpdateResponse`, (response) => {
                this.algoliaResponse = response;
            });
        }
    }
</script>