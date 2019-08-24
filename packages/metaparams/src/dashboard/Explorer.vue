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
            <results v-show="panelCurrentTab === 'hits'" :panel-key="panelKey"
                :search-response="algoliaResponse"
                :analyse-response="analyseAlgoliaResponse"
                :search-params="searchParams"
                :index-settings="refIndexSettings"
                :analyse-max-nb-points="analyseMaxNbPoints"
                :read-only="isReadOnly"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                :index-name="panelIndexName"
                :server="panelServer"
                :query="searchParams.query !== undefined ? searchParams.query : $store.state.panels.query"
                :display-mode="displayMode"
                :showSearchableAttributes="$store.state.panels.showSearchableAttributes"
                :showCustomRanking="$store.state.panels.showCustomRanking"
                :showAttributesForFaceting="$store.state.panels.showAttributesForFaceting"
                :showOnlyMatchingAttributes="$store.state.panels.showOnlyMatchingAttributes"
                :can-jump-rules="canJumpRules"
                :can-jump-records="canJumpRecords"
                :jump-to="otherPanelKey"
                :image-size="panelImageSize"
                :image-attribute="panelImageAttributeName"
                :image-base-url="panelImageBaseUrl"
                :image-suffix-url="panelImageSuffixUrl"
                :title-attribute-name="panelTitleAttribute"
                :auto-title-attribute-name="panelAutoTitleAttributeName"
                :keys-indexer="panelKeysIndexer"
                :display-ranking-info="$store.state.panels.displayRankingInfo"
                @onUpdateAnalyseMaxNbPoint="analyseMaxNbPoints = $event"
                @onUpdateDisplayMode="displayMode = $event"
                @onUpdatePage="onUpdatePage"
                @onUpdateImageAttribute="panelImageAttributeName = $event"
                @onUpdateImageBaseUrl="panelImageBaseUrl = $event"
                @onUpdateImageSuffixUrl="panelImageSuffixUrl = $event"
                @onUpdateImageSize="panelImageSize = $event"
                @onUpdateTitleAttributeName="panelTitleAttribute = $event"
                @onUpdateAutoTitleAttributeName="panelAutoTitleAttributeName = $event"
                @onUpdateCursor="onUpdateCursor"
                @onDeleteCursor="onDeleteCursor"

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
                :image-size="panelImageSize"
                :image-attribute="panelImageAttributeName"
                :image-base-url="panelImageBaseUrl"
                :image-suffix-url="panelImageSuffixUrl"
                :title-attribute-name="panelTitleAttribute"
                :auto-title-attribute-name="panelAutoTitleAttributeName"
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
                :image-size="panelImageSize"
                :image-attribute="panelImageAttributeName"
                :image-base-url="panelImageBaseUrl"
                :image-suffix-url="panelImageSuffixUrl"
                :title-attribute-name="panelTitleAttribute"
                :auto-title-attribute-name="panelAutoTitleAttributeName"
                :read-only="isReadOnly"
                :can-jump-rules="canJumpRules"
                :jump-to="otherPanelKey"
            />
            <checks
                v-show="panelCurrentTab === 'checks'"
                :index-analyser="panelIndexData.indexAnalyzer"
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
        props: ['panelKey'],
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
                const panelIndexData = this.$store.state.apps[appId][indexName];

                if (!panelIndexData || !panelIndexData.refIndexSettings) return false;

                return !panelIndexData.refIndexSettings.primary;
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
            onUpdatePage: function (page) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setParamValue`, {
                    configKey: this.searchConfigKey,
                    key: 'page',
                    value: page
                });
            },
            onUpdateCursor: function (cursor) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setParamValue`, {
                    configKey: this.searchConfigKey,
                    key: 'cursor',
                    value: cursor
                });
            },
            onDeleteCursor: function () {
                this.$store.commit(`${this.panelIndexCommitPrefix}/deleteParam`, {
                    configKey: this.searchConfigKey,
                    inputKey: 'cursor',
                });
            }
        },
    }
</script>