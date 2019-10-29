<template>
    <div>
        <div
            class="flex border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
            <div
                class="mx-8 p-8"
                :class="`${panelCurrentTab === 'hits' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                @click="panelCurrentTab = 'hits'"
            >
                Hits <span v-if="!isNaN(nbHits)">({{formatHumanNumber(nbHits)}})</span>
            </div>
            <div
                class="mx-8 p-8"
                :class="`${panelCurrentTab === 'synonyms' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                @click="panelCurrentTab = 'synonyms'"
            >
                Synonyms ({{formatHumanNumber(this.nbSynonyms)}})
            </div>
            <div
                class="mx-8 p-8"
                :class="`${panelCurrentTab === 'rules' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                @click="panelCurrentTab = 'rules'"
            >
                Rules ({{formatHumanNumber(this.nbRules)}})
            </div>
            <div
                class="mx-8 p-8"
                :class="`${panelCurrentTab === 'checks' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                @click="panelCurrentTab = 'checks'"
            >
                Checks ({{formatHumanNumber(nbChecks)}})
            </div>
        </div>
        <div class="p-8">
            <perform-search
                :search-params="searchParams"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                :server="panelServer"
                :index-name="panelIndexName"
                :method="panelMethod"
                :query="$store.state.panels.query"
                :fetch-explain="$store.state.panels.displayRankingInfo"
                :analyse-hits-per-page="$store.state.panels.analyseMaxNbPoints"
                :fetch-facets="true"
                @onFetchHits="onFetchHits"
                @onFetchAnalyseHits="onFetchAnalyseHits"
                @onUpdateError="errorMessage = $event"
            />
            <error-message
                v-if="errorMessage"
                :error-message="errorMessage"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                @onUpdateApiKey="panelAdminAPIKey = $event"
            />
            <results
                v-show="panelCurrentTab === 'hits'"
                class="w-full"
                :panel-key="panelKey"
                :search-response="algoliaResponse"
                :analyse-response="analyseAlgoliaResponse"
                :search-params="searchParams"
                :index-settings="refIndexSettings"
                :analyse-max-nb-points="analyseMaxNbPoints"
                :read-only="readOnly"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                :index-name="panelIndexName"
                :server="panelServer"
                :method="panelMethod"
                :query="searchParams.query !== undefined ? searchParams.query : $store.state.panels.query"
                :display-mode="displayMode"
                :showSearchableAttributes="$store.state.panels.showSearchableAttributes"
                :showCustomRanking="$store.state.panels.showCustomRanking"
                :showAttributesForFaceting="$store.state.panels.showAttributesForFaceting"
                :showOnlyMatchingAttributes="$store.state.panels.showOnlyMatchingAttributes"
                :can-jump-rules="canJumpRules"
                :can-jump-records="canJumpRecords"
                :jump-to="otherPanelKey"
                :image-size="indexImageSize"
                :image-attribute="indexImageAttributeName"
                :image-base-url="indexImageBaseUrl"
                :image-suffix-url="indexImageSuffixUrl"
                :title-attribute-name="indexTitleAttribute"
                :auto-title-attribute-name="indexAutoTitleAttributeName"
                :keys-indexer="indexKeysIndexer"
                :display-ranking-info="$store.state.panels.displayRankingInfo"
                @onUpdateAnalyseMaxNbPoint="analyseMaxNbPoints = $event"
                @onUpdateDisplayMode="displayMode = $event"
                @onUpdatePage="onSetParamValue('page', $event)"
                @onSetParamValue="onSetParamValue"
                @onDeleteParam="onDeleteParam"
                @onUpdateImageAttribute="indexImageAttributeName = $event"
                @onUpdateImageBaseUrl="indexImageBaseUrl = $event"
                @onUpdateImageSuffixUrl="indexImageSuffixUrl = $event"
                @onUpdateImageSize="indexImageSize = $event"
                @onUpdateTitleAttributeName="indexTitleAttribute = $event"
                @onUpdateAutoTitleAttributeName="indexAutoTitleAttributeName = $event"
            />
            <fetcher
                v-show="panelCurrentTab === 'synonyms'"
                method-name="searchSynonyms"
                :panel-key="panelKey"
                @onFetch="onFetchSynonyms"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                :index-name="panelIndexName"
                :server="panelServer"
                :image-size="indexImageSize"
                :image-attribute="indexImageAttributeName"
                :image-base-url="indexImageBaseUrl"
                :image-suffix-url="indexImageSuffixUrl"
                :title-attribute-name="indexTitleAttribute"
                :auto-title-attribute-name="indexAutoTitleAttributeName"
                :read-only="readOnly"
                :can-jump-synonyms="canJumpSynonyms"
                :jump-to="otherPanelKey"
            />
            <fetcher
                v-show="panelCurrentTab === 'rules'"
                method-name="searchRules"
                :panel-key="panelKey"
                @onFetch="onFetchRules"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                :index-name="panelIndexName"
                :server="panelServer"
                :image-size="indexImageSize"
                :image-attribute="indexImageAttributeName"
                :image-base-url="indexImageBaseUrl"
                :image-suffix-url="indexImageSuffixUrl"
                :title-attribute-name="indexTitleAttribute"
                :auto-title-attribute-name="indexAutoTitleAttributeName"
                :read-only="readOnly"
                :can-jump-rules="canJumpRules"
                :jump-to="otherPanelKey"
            />
            <checks
                v-show="panelCurrentTab === 'checks'"
                :index-analyser="indexData.indexAnalyzer"
                :searchParams="searchParams"
                :indexSettings="indexSettings"
                @onUpdateCount="onUpdateChecksCount"
            />
        </div>
    </div>
</template>
<script>
    import {formatHumanNumber} from 'common/utils/formatters'

    import PerformSearch from "common/components/explorer/results/PerformSearch";
    import Results from "common/components/explorer/results/Results";
    import ErrorMessage from "common/components/explorer/results/ErrorMessage";
    import Fetcher from "common/components/explorer/synonyms-rules/Fetcher";
    import Checks from "common/components/explorer/checks/Checks";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'Explorer',
        components: {Checks, Fetcher, Results, PerformSearch, ErrorMessage},
        props: ['panelKey', 'readOnly'],
        mixins: [indexInfoMixin, panelsMixin],
        data: function () {
            return {
                nbHits: 0,
                nbRules: 0,
                nbSynonyms: 0,
                nbChecks: 0,
                errorMessage: null,
                algoliaResponse: null,
                analyseAlgoliaResponse: null,
            };
        },
        computed: {
            appId: function () { // Needed for indexInfoMixin
                return this.panelAppId;
            },
            indexName: function () { // Needed for indexInfoMixin
                return this.panelIndexName;
            },
            displayMode: {
                get () {
                    return this.$store.state.panels[this.panelKey].displayMode || 'list';
                },
                set (value) {
                    this.$store.commit(`panels/${this.panelKey}/setDisplayMode`, value);
                }
            },
            otherPanelKey: function () {
                return this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
            },
            canJumpRules: function () {
                if (!this.$store.state.panels.splitMode) return false;
                if (this.sameIndexOnEachPanel) return false;

                const otherPanelKey = this.otherPanelKey;

                return this.$store.state.panels[otherPanelKey].currentTab === 'rules';
            },
            canJumpSynonyms: function () {
                if (!this.$store.state.panels.splitMode) return false;
                if (this.sameIndexOnEachPanel) return false;

                const otherPanelKey = this.otherPanelKey;

                return this.$store.state.panels[otherPanelKey].currentTab === 'synonyms';
            },
            canJumpRecords: function () {
                if (!this.$store.state.panels.splitMode) return false;
                if (this.sameIndexOnEachPanel) return false;

                const otherPanelKey = this.otherPanelKey;
                const otherPanelCurrentTabIsHits = this.$store.state.panels[otherPanelKey].currentTab === 'hits';
                const otherPanelInListMode = this.$store.state.panels[otherPanelKey].displayMode === 'list';

                if (!otherPanelCurrentTabIsHits || !otherPanelInListMode) return false;

                const appId = this.$store.state.panels[otherPanelKey].appId;
                const indexName = this.$store.state.panels[otherPanelKey].indexName;
                const indexData = this.$store.state.apps[appId][indexName];

                if (!indexData || !indexData.refIndexSettings) return false;

                return !indexData.refIndexSettings.primary;
            },
        },
        methods: {
            formatHumanNumber,
            onFetchSynonyms: function (synonyms, nbSynonyms) {
                this.nbSynonyms = nbSynonyms;
            },
            onFetchRules: function (rules, nbRules) {
                this.nbRules = nbRules;
            },
            onFetchHits: function (algoliaResponse) {
                this.$root.$emit(`${this.panelKey}UpdateResponse`, algoliaResponse);
                this.algoliaResponse = algoliaResponse;
                this.nbHits = algoliaResponse ? algoliaResponse.nbHits : 0;
                this.$emit('onFetchHits', algoliaResponse);
            },
            onFetchAnalyseHits: function (algoliaResponse) {
                this.$root.$emit(`${this.panelKey}UpdateAnalyseResponse`, algoliaResponse);
                this.analyseAlgoliaResponse = algoliaResponse;
                this.$emit('onFetchAnalyseHits', algoliaResponse);
            },
            onUpdateChecksCount: function (event) {
                this.nbChecks = event;
            },
            onSetParamValue: function (key, value) {
                this.$store.commit(`${this.indexCommitPrefix}/setParamValue`, {
                    configKey: this.searchConfigKey,
                    key: key,
                    value: value
                });
            },
            onDeleteParam: function (key) {
                this.$store.commit(`${this.indexCommitPrefix}/deleteParam`, {
                    configKey: this.searchConfigKey,
                    inputKey: key,
                });
            },
        },
    }
</script>
