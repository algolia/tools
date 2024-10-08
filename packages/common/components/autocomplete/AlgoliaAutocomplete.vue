<template>
    <div>
        <autocomplete
            ref="autocomplete"
            :items="items"
            :refine="refine"
            :value="value"
            :display-empty-query="displayEmptyQuery"
            :empty-search-for-query-equals-value="true"
            v-on="$listeners"
        >
            <template v-slot:item="{ index, item }">
                <slot v-bind:index="index" v-bind:item="item">
                    <!-- XSS Check: all values are being constructed using `escapeHtml` -->
                    <div
                        v-html="item._highlightResult[displayAttributeName] ? unescapeEm(escapeHtml(item._highlightResult[displayAttributeName].value)): escapeHtml(item[displayAttributeName])"
                    >
                    </div>
                </slot>
            </template>
        </autocomplete>
    </div>
</template>

<script>
import Autocomplete from "./Autocomplete.vue";
import algoliasearch from "algoliasearch";
import {escapeHtml, unescapeEm} from "common/utils/formatters";

export default {
    name: 'AlgoliaAutocomplete',
    components: {Autocomplete},
    props: ['indexName', 'searchParams', 'displayAttributeName', 'value', 'displayEmptyQuery', 'appId', 'apiKey'],
    data: function () {
        return {
            items: []
        }
    },
    computed: {
        algoliaIndex: function () {
            return algoliasearch(this.appId, this.apiKey).initIndex(this.indexName)
        }
    },
    methods: {
        refine: async function (query) {
            const data = await this.algoliaIndex.search(query, this.searchParams || {});
            this.items = data.hits;
        },
        escapeHtml,
        unescapeEm,
    },
    created: function () {
        this.refine('');
    },
}
</script>
