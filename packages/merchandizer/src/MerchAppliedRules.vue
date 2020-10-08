<template>
    <div v-if="rules.length > 0" class="mt-32 break-words">
        <div>
            <div v-for="(rule, i) in rules" :key="`${rule.objectID}`">
                <merch-rule
                    :rule="rule"
                    :imageSize="config.imageSize"
                    :imageAttribute="config.imageAttribute"
                    :imageBaseUrl="config.imageBaseUrl"
                    :imageSuffixUrl="config.imageSuffixUrl"
                    :ignoreImageProxy="config.ignoreImageProxy"
                    :titleAttributeName="config.titleAttributeName"
                    v-bind="$props"
                />
            </div>
        </div>
    </div>
</template>

<script>
import props from "common/components/explorer/props";
import {getSearchIndex} from "common/utils/algoliaHelpers";
import MerchRule from "./MerchRule";

export default {
    name: 'MerchAppliedRules',
    components: {MerchRule},
    props: [
        ...props.credentials,
        ...props.images,
        ...props.actions,
        ...props.attributes,
        'keysIndexer',
        'config',
    ],
    data: function () {
        return {
            rules: [],
            searchResponse: null,
            panelKey: 'leftPanel',
        }
    },
    created: function () {
        this.loadRules();
        this.$root.$on(`${this.panelKey}UpdateResponse`, (response) => {
            this.searchResponse = response;
        });
    },
    watch: {
        ruleIds: function () {
            this.loadRules();
        }
    },
    computed: {
        ruleIds: function () {
            if (!this.searchResponse || !this.searchResponse.appliedRules) return [];
            return this.searchResponse.appliedRules.map((r) => r.objectID);
        }
    },
    methods: {
        loadRules: async function () {
            if (!this.appId || !this.apiKey || this.ruleIds.length <= 0) {
                this.rules = [];
                return;
            }

            const index = await getSearchIndex(this.appId, this.apiKey, this.indexName);
            const promises = this.ruleIds.map((id) => index.getRule(id))
            this.rules = await Promise.all(promises);
        }
    }
}
</script>
