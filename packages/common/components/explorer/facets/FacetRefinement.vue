<template>
    <div class="flex mb-4">
        <div
            class="truncate cursor-pointer hover:underline mr-8 hit"
            :class="refinement.isActive ? 'font-bold underline' : ''"
            @click="toggleRefinement(refinement.value)"
            v-html="refinement.highlighted"
        >
        </div>
        <div
            class="ml-auto text-nova-grey"
            v-if="refinement.count !== undefined"
        >
            {{refinement.count}}
        </div>
    </div>
</template>

<script>
    export default {
        name: 'FacetRefinement',
        props: ['facetName', 'refinement', 'appId', 'indexName', 'searchParams', 'configKey'],
        computed: {
            facetFilters: function () {
                return this.searchParams.facetFilters || [];
            },
        },
        methods: {
            toggleRefinement: function (refinement) {
                const newFacetFilters = this.facetFilters.filter((r) => {
                    if (Array.isArray(r)) {
                        return r.filter((r2) => !r2.startsWith(`${this.facetName}:`));
                    }
                    return !r.startsWith(`${this.facetName}:`); // Todo handle arrays
                });
                if (!this.refinement.isActive) {
                    newFacetFilters.push(`${this.facetName}:${refinement}`);
                }

                this.$store.commit(`apps/${this.appId}/${this.indexName}/setParamValue`, {
                    configKey: this.configKey,
                    key: 'facetFilters',
                    value: newFacetFilters,
                });
            },
        }
    }
</script>