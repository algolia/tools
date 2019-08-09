<template>
    <div>
        <autocomplete
            ref="autocomplete"
            :items="items"
            :refine="refine"
            :value="value"
            :display-empty-query="displayEmptyQuery"
            :placeholder="placeholder"
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

    export default {
        name: 'HitsAutocomplete',
        components: {PromotedHit, Autocomplete},
        props: [
            'params', 'value', 'displayEmptyQuery', 'placeholder',
            ...props.credentials,
            ...props.images,
            ...props.attributes,
        ],
        data: function () {
            return {
                algoliaResponse: null,
                items: []
            }
        },
        methods: {
            refine: async function (query) {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server);
                this.algoliaResponse = await index.customSearch(query, this.params || {});
                this.items = this.algoliaResponse.hits;
            },
        },
        created: function () {
            this.refine('');
        },
    }
</script>