<template>
    <div>
        <autocomplete
            ref="autocomplete"
            :items="items"
            :refine="refine"
            :value="value"
            :display-empty-query="displayEmptyQuery"
            :placeholder="placeholder"
            :input-classes="inputClasses"
            :empty-search-for-query-equals-value="false"
            :no-auto-width="true"
            v-on="$listeners"
        >
            <template slot="item" slot-scope="{ index, item }">
                <promoted-hit
                    :hit="item"
                    class="w-240"
                    v-bind="$props"
                    v-on="$listeners"
                />
            </template>
        </autocomplete>
    </div>
</template>

<script>
    import Autocomplete from "./Autocomplete";
    import PromotedHit from "../explorer/synonyms-rules/PromotedHit";
    import {getSearchIndex} from "../../utils/algoliaHelpers";
    import props from "../explorer/props";
    import titleAttribute from "../../mixins/titleAttribute";

    export default {
        name: 'HitsAutocomplete',
        components: {PromotedHit, Autocomplete},
        mixins: [titleAttribute],
        props: [
            'inputClasses', 'params', 'value', 'displayEmptyQuery', 'placeholder',
            ...props.credentials,
            ...props.images,
            ...props.attributes,
            ...props.paramsAndSettings,
        ],
        data: function () {
            return {
                searchResponse: null,
                items: []
            }
        },
        methods: {
            refine: async function (query) {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                const res = await index.customSearch({
                    query,
                    ...(this.params || {}),
                });
                if (res.hits.length === 0) {
                    const res2 = await index.getObjects([query]);
                    if (res2.results.length > 0 && res2.results[0] !== null) {
                        const items = res2.results || [];
                        this.items = Object.freeze(items);
                        this.searchResponse = Object.freeze({hits: items});
                        return;
                    }
                }
                this.searchResponse = Object.freeze(res);
                this.items = Object.freeze(res.hits);
            },
        },
        created: function () {
            this.refine('');
        },
    }
</script>
