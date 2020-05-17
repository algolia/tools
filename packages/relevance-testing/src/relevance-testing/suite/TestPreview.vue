<template>
    <div>
        <error-message
            v-if="errorMessage"
            :error-message="errorMessage"
            :app-id="appId"
            :api-key="apiKey"
            @onUpdateApiKey="onUpdateApiKey"
        />
        <perform-search
            :app-id="appId"
            :api-key="apiKey"
            :index-name="indexName"
            method="search"
            :search-params="params"
            query=""
            :title-attribute-name="indexTitleAttribute"
            :fetch-explain="$store.state.panels.displayRankingInfo"
            :analyse-hits-per-page="maxNbPoints"
            @onUpdateAutoTitleAttributeName="indexAutoTitleAttributeName = $event"
            @onFetchHits="searchResponse = $event"
            @onFetchAnalyseHits="onFetchAnalyticsHits"
            @onUpdateError="errorMessage = $event"
        />
        <results
            v-if="indexData"
            :search-response="searchResponse"
            :analyse-response="analyseResponse"
            :search-params="currentTest.testData.when"
            :index-settings="refIndexSettings"
            :analyse-max-nb-points="maxNbPoints"
            panel-key="leftPanel"
            :read-only="true"
            :is-replica="false"
            :app-id="appId"
            :api-key="apiKey"
            :index-name="indexName"
            :harcoded-query="true"
            :query="currentTest.testData.when.query !== undefined ? currentTest.testData.when.query : ''"
            :display-mode="displayMode"
            :showSearchableAttributes="$store.state.panels.showSearchableAttributes"
            :showCustomRanking="$store.state.panels.showCustomRanking"
            :showAttributesForFaceting="$store.state.panels.showAttributesForFaceting"
            :showOnlyMatchingAttributes="$store.state.panels.showOnlyMatchingAttributes"
            :can-jump-rules="false"
            :can-jump-records="false"
            :ignore-image-proxy="indexIgnoreImageProxy"
            :image-size="indexImageSize"
            :image-attribute="indexImageAttributeName"
            :image-base-url="indexImageBaseUrl"
            :image-suffix-url="indexImageSuffixUrl"
            :title-attribute-name="indexTitleAttribute"
            :auto-title-attribute-name="indexAutoTitleAttributeName"
            :keys-indexer="indexKeysIndexer"
            :display-ranking-info="$store.state.panels.displayRankingInfo"
            @onUpdatePage="$emit('onUpdatePage', $event)"
            @onUpdateAnalyseMaxNbPoint="maxNbPoints = $event"
            @onUpdateDisplayMode="displayMode = $event"
            @onUpdateIgnoreImageProxy="indexIgnoreImageProxy = $event"
            @onUpdateImageAttribute="indexImageAttributeName = $event"
            @onUpdateImageBaseUrl="indexImageBaseUrl = $event"
            @onUpdateImageSuffixUrl="indexImageSuffixUrl = $event"
            @onUpdateImageSize="indexImageSize = $event"
            @onUpdateTitleAttributeName="indexTitleAttribute = $event"
            @onUpdateAutoTitleAttributeName="indexAutoTitleAttributeName = $event"
        />
    </div>
</template>

<script>
    import Results from "common/components/explorer/results/Results";
    import PerformSearch from "common/components/explorer/results/PerformSearch";
    import ErrorMessage from "common/components/explorer/results/ErrorMessage";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import {algoliaParams} from "common/utils/algoliaHelpers";

    export default {
        name: 'TestPreview',
        components: {Results, PerformSearch, ErrorMessage},
        mixins: [indexInfoMixin],
        props: ['currentTest', 'currentRun', 'page'],
        data: function () {
            return {
                searchResponse: null,
                analyseResponse: null,
                errorMessage: null,
                maxNbPoints: 100,
                requestNumber: 0,
                requestNumberReceived: 0,
                displayMode: 'list',
                panelKey: 'leftPanel',
            }
        },
        computed: {
            appId: function () {
                return this.currentRun.app_id;
            },
            indexName: function () {
                return this.currentRun.index_name;
            },
            apiKey: function () {
                if (this.$store.state.apps[this.appId]) {
                    return this.$store.state.apps[this.appId].key;
                }
                return '';
            },
            params: function () {
                return Object.assign(
                    {},
                    this.currentTest.testData.when,
                    algoliaParams(this.currentRun.params),
                    {
                        hitsPerPage: this.currentRun.hits_per_page,
                        getRankingInfo: true,
                        analytics: false,
                        enableABTest: false,
                        page: this.page,
                    }
                );
            },
        },
        methods: {
            onFetchAnalyticsHits: function (algoliaResponse) {
                this.analyseResponse = algoliaResponse;
                this.$root.$emit(`leftPanelUpdateAnalyseResponse`, algoliaResponse);
            },
            onUpdateApiKey: function (apiKey) {
                this.$store.commit(`apps/${this.appId}/setKey`, {
                    keyName: 'key',
                    value: apiKey,
                });
            },
        }
    }
</script>
