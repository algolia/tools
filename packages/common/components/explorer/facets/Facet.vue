<template>
    <div class="mb-32" v-if="facetValues">
        <div class="mb-12 text-solstice-blue break-all">
            {{facetName}}
        </div>
        <div v-if="isSearchable">
            <input
                :value="searchQuery"
                @input="refine"
                :placeholder="`Search ${this.facetName}`"
                class="input-custom px-8 py-4 mb-12 w-full"
            />
        </div>
        <div class="px-8">
            <facet-refinement
                v-for="value in displayedValues"
                :refinement="value"
                v-bind="$props"
                v-on="$listeners"
            />
            <div
                v-if="values.length > 10"
                @click="collapse = !collapse"
                class="text-nebula-blue cursor-pointer hover:underline"
            >
                {{collapse ? `Show all (${values.length})` : 'Show less'}}
            </div>
        </div>
    </div>
</template>

<script>
    import FacetRefinement from "./FacetRefinement";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";

    export default {
        name: 'Facet',
        components: {FacetRefinement},
        props: ['facetName', 'facetValues', 'appId', 'indexName', 'query', 'searchParams', 'indexSettings', 'configKey'],
        data: function () {
            return {
                collapse: true,
                searchQuery: '',
                searchedRefinements: [],
            }
        },
        watch: {
            appId: function () { this.searchQuery = ''; this.refine(); },
            indexName: function () { this.searchQuery = ''; this.refine(); },
            query: function () { this.refine(); },
            searchParams: function () { this.refine(); },
            indexSettings: function () { this.refine(); },
        },
        computed: {
            facetFilters: function () {
                return this.searchParams.facetFilters || [];
            },
            isSearchable: function () {
                return (this.indexSettings.attributesForFaceting || []).some((attribute) => {
                    return attribute === `searchable(${this.facetName})`;
                });
            },
            fetchedOrSearchedValues: function () {
                if (this.searchQuery.length > 0) {
                    return this.searchedRefinements;
                }

                return Object.keys(this.facetValues).map((key) => {
                    const isActive = this.facetFilters.some((r) => {
                        return r === `${this.facetName}:${key}`;
                    });

                    return {
                        value: key,
                        highlighted: key,
                        count: this.facetValues[key],
                        isActive,
                    };
                })
            },
            values: function () {
                const filteredValues = this.facetFilters.filter((f) => {
                    return !Array.isArray(f) && f.startsWith(`${this.facetName}:`)
                }).map((f) => {
                    const parts = f.split(':');
                    const [key, value] = parts;
                    return value;
                });

                filteredValues.forEach((v) => {
                    if (!this.fetchedOrSearchedValues.some((a) => a[0] === v)) {
                        this.fetchedOrSearchedValues.unshift([v, undefined, true]);
                    }
                })
                return this.fetchedOrSearchedValues.sort((a, b) => b.count - a.count).sort((a, b) => b.isActive - a.isActive);
            },
            displayedValues: function () {
                if (this.collapse) {
                    return this.values.slice(0, 10);
                }
                return this.values;
            }
        },
        methods: {
            refine: async function ($event) {
                if ($event) this.searchQuery = $event.target.value;
                if (this.searchQuery.length <= 0) {
                    this.searchedRefinements = [];
                    return;
                }
                if (!this.isSearchable) return;

                const index = await getSearchIndex(this.appId, this.$store.state.apps[this.appId].key, this.indexName);

                const res = await index.customSearchForFacetValues({
                    facetName: this.facetName,
                    facetQuery: this.searchQuery,
                    ...this.searchParams,
                    facetFilters: index.buildFacetFilters(this.facetFilters, `${this.facetName}:`),
                    query: this.query,
                });

                this.searchedRefinements = res.facetHits.map((hit) => {
                    const isActive = this.facetFilters.some((r) => {
                        return r === `${this.facetName}:${hit.value}`;
                    });

                    return {
                        ...hit,
                        isActive,
                    };
                });
            }
        }
    }
</script>