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
                <promoted-hit :panel-key="panelKey" :hit="item" class="w-240"/>
            </template>
        </autocomplete>
    </div>
</template>

<script>
    import Autocomplete from "../autocomplete/Autocomplete";
    import indexInfoMixin from "@/mixins/indexInfoMixin";
    import PromotedHit from "@/explorer/synonyms-rules/PromotedHit";

    export default {
        name: 'PanelHitAutocomplete',
        components: {PromotedHit, Autocomplete},
        props: ['panelKey', 'params', 'value', 'displayEmptyQuery', 'placeholder'],
        mixins: [indexInfoMixin],
        data: function () {
            return {
                algoliaResponse: null,
                items: []
            }
        },
        computed: {
            algoliaIndex: function () {
                return this.algoliasearch(this.panelAppId, this.panelAdminAPIKey).initIndex(this.panelIndexName);
            }
        },
        methods: {
            refine: async function (query) {
                this.algoliaResponse = await this.algoliaIndex.search(query, this.params || {});
                this.items = this.algoliaResponse.hits;
            },
        },
        created: function () {
            this.refine('');
        },
    }
</script>