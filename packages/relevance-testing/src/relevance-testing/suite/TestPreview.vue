<template>
    <div>
        <error-message
            v-if="errorMessage"
            :error-message="errorMessage"
            :app-id="currentRun.app_id"
            :api-key="currentRun.api_key"
            @onUpdateApiKey="panelAdminAPIKey = $event"
        />
        <perform-search
            :app-id="currentRun.app_id"
            :api-key="currentRun.api_key"
            :index-name="currentRun.index_name"
            method="search"
            :search-params="currentTest.testData.when"
            query=""
            :fetch-explain="$store.state.panels.displayRankingInfo"
            :analyse-hits-per-page="maxNbPoints"
            @onFetchHits="searchResponse = $event"
            @onFetchAnalyseHits="analyseResponse = $event"
            @onUpdateError="errorMessage = $event"
        />
        <results
            v-if="panelIndexData"
            :search-response="searchResponse"
            :analyse-response="analyseResponse"
            :search-params="currentTest.testData.when"
            :index-settings="refIndexSettings"
            :analyse-max-nb-points="maxNbPoints"
            :read-only="true"
            :app-id="currentRun.app_id"
            :api-key="currentRun.api_key"
            :index-name="currentRun.index_name"
            :query="currentTest.testData.when.query !== undefined ? currentTest.testData.when.query : ''"
            :display-mode="displayMode"
            :showSearchableAttributes="$store.state.panels.showSearchableAttributes"
            :showCustomRanking="$store.state.panels.showCustomRanking"
            :showAttributesForFaceting="$store.state.panels.showAttributesForFaceting"
            :showOnlyMatchingAttributes="$store.state.panels.showOnlyMatchingAttributes"
            :can-jump-rules="false"
            :can-jump-records="false"
            :image-size="panelImageSize"
            :image-attribute="panelImageAttributeName"
            :image-base-url="panelImageBaseUrl"
            :image-suffix-url="panelImageSuffixUrl"
            :title-attribute-name="panelTitleAttribute"
            :auto-title-attribute-name="panelAutoTitleAttributeName"
            :keys-indexer="panelKeysIndexer"
            :display-ranking-info="$store.state.panels.displayRankingInfo"
            :disable-pagination="true"
            @onUpdateAnalyseMaxNbPoint="maxNbPoints = $event"
            @onUpdateDisplayMode="displayMode = $event"
            @onUpdateImageAttribute="panelImageAttributeName = $event"
            @onUpdateImageBaseUrl="panelImageBaseUrl = $event"
            @onUpdateImageSuffixUrl="panelImageSuffixUrl = $event"
            @onUpdateImageSize="panelImageSize = $event"
            @onUpdateTitleAttributeName="panelTitleAttribute = $event"
            @onUpdateAutoTitleAttributeName="panelAutoTitleAttributeName = $event"
        />
    </div>
</template>

<script>
    import Results from "common/components/explorer/results/Results";
    import PerformSearch from "common/components/explorer/results/PerformSearch";
    import ErrorMessage from "common/components/explorer/results/ErrorMessage";
    import indexInfoMixin from "common/mixins/indexInfoMixin";

    export default {
        name: 'TestPreview',
        components: {Results, PerformSearch, ErrorMessage},
        mixins: [indexInfoMixin],
        props: ['currentTest', 'currentRun'],
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
        }
    }
</script>