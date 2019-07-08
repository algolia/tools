<template>
    <div>
        <div
            class="flex border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
            <div
                class="mx-8 p-8"
                :class="`${panelCurrentTab === 'hits' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                @click="panelCurrentTab = 'hits'"
            >
                Hits ({{formatHumanNumber(nbHits)}})
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
        <div v-if="errorMessage.length > 0" class="border border-mars-1 m-16 p-8 rounded">
            <div>{{errorMessage}}</div>
            <div v-if="errorMessage.includes('Invalid Application-ID or API key')" class="mt-12">
                <div>App Id: {{panelAppId}}</div>
                <div>API Key: <input v-model="panelAdminAPIKey" class="input-custom inline" placeholder="adminAPIKey" /></div>
            </div>
        </div>
        <div v-if="algoliaResponse" class="p-8">
            <results v-show="panelCurrentTab === 'hits'" :algolia-response="algoliaResponse"
                     :panel-key="panelKey"/>
            <fetcher v-show="panelCurrentTab === 'synonyms'" :panel-key="panelKey" method-name="searchSynonyms"
                     @onFetch="onFetchSynonyms"/>
            <fetcher v-show="panelCurrentTab === 'rules'" :panel-key="panelKey" method-name="searchRules"
                     @onFetch="onFetchRules"/>
            <checks v-show="panelCurrentTab === 'checks'" :panel-key="panelKey" @onUpdateCount="onUpdateChecksCount"/>
        </div>
    </div>
</template>
<script>
    import {formatHumanNumber, cleanAttributeName} from 'common/utils/formatters'
    import Vue from 'vue';
    import searchIndexer from '../autocomplete/search-indexer';
    import analyseIndex from 'common/utils/indexAnalyzer';
    import paramsSpecs from 'common/utils/paramsSpecs';

    import Results from "@/explorer/results/Results";
    import Fetcher from "@/explorer/synonyms-rules/Fetcher";
    import Checks from "@/explorer/checks/Checks";
    import RankingInfoAnalyser from "@/explorer/hits/rankingInfoAnalyser"
    import indexMixin from "@/mixins/indexMixin";
    import panelsMixin from "@/mixins/panelsMixin";

    import {goToAnchor} from "common/utils/domHelpers";

    export default {
        name: 'Explorer',
        components: {Checks, Fetcher, Results},
        props: ['panelKey'],
        mixins: [indexMixin, panelsMixin],
        data: function () {
            return {
                nbHits: 0,
                nbRules: 0,
                nbSynonyms: 0,
                nbChecks: 0,
                algoliaResponse: null,
                errorMessage: '',
                anchor: null,
                advancedIndexSettingsNames: ['indexingGeolocPrecision','maxNbHits','nbShards','nbShardsAuto','approxSubstIsBetter','maxApproxIVSizeForEachWord','maxApproxWords'],
            };
        },
        created: async function () {
            this.init();
            this.$root.$on('shouldTriggerSearch', (indexName) => {
                if (indexName === this.panelIndexName) {
                    this.triggerSearch();
                    this.triggerAnalyseSearch();
                }
            });

            this.$root.$on('wantsToGoToAnchorAtNext', (anchor) => {
                this.anchor = anchor;
            });
        },
        watch: {
            panelServer: function (o, n) {
                if (o !== n) this.triggerSearch();
            },
            searchParamsWithDefaults: function (o, n) {
                if (JSON.stringify(o) !== JSON.stringify(n)) this.triggerSearch();
            },
            searchParamsForAnalysis: function (o, n) {
                if (JSON.stringify(o) !== JSON.stringify(n)) this.triggerAnalyseSearch();
            },
            panelAppId: function (o, n) { if (o !== n) this.init() },
            panelIndexName: function (o, n) { if (o !== n) this.init() },
            panelAdminAPIKey: function (o, n) { if (o !== n) this.init() },
            query: function () {
                this.$store.commit(`${this.panelIndexCommitPrefix}/deleteParam`, {
                    configKey: this.searchConfigKey,
                    inputKey: 'page'
                });
            },
        },
        computed: {
            query: function () {
                return this.$store.state.panels.query;
            },
            searchParamsWithDefaults: function () {
                const nonForcedparams = {
                    hitsPerPage: 8,
                    query: this.query,
                    attributesToSnippet: ['*:10'],
                    snippetEllipsisText: '…',
                    attributesToRetrieve: ['*'],
                };

                if (this.$store.state.panels.displayRankingInfo) {
                    nonForcedparams['explain'] = 'match.alternatives';
                }

                const forcedParams = {
                    analytics: false,
                    enableABTest: false,
                    getRankingInfo: true,
                    highlightPreTag: '<em>',
                    highlightPostTag: '</em>',
                };

                return Object.assign(nonForcedparams, this.searchParams, forcedParams);
            },
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.refIndexSettings);
            },
            criteria: function () {
                return this.rankingInfoAnalyzer.getActualCriteria();
            },
            searchParamsForAnalysis: function () {
                const attributesToRetrieve = this.criteria.map((criterion) => {
                    return cleanAttributeName(criterion)
                });
                attributesToRetrieve.push('_geoloc');

                return Object.assign(
                    {
                        query: this.$store.state.panels.query
                    },
                    this.searchParams,
                    {
                        page: 0,
                        analytics: false,
                        enableABTest: false,
                        getRankingInfo: true,
                        hitsPerPage: this.$store.state.panels.analyseMaxNbPoints,
                        attributesToSnippet: [],
                        attributesToHighlight: [],
                        attributesToRetrieve: attributesToRetrieve,
                    },
                )
            },
        },
        methods: {
            init: function () {
                this.triggerSearch();
                this.triggerAnalyseSearch();
                this.loadIndexSettings();
                this.loadKeysIndexer();
            },
            formatHumanNumber,
            onFetchSynonyms: function (synonyms, nbSynonyms) {
                this.nbSynonyms = nbSynonyms;
            },
            onFetchRules: function (rules, nbRules) {
                this.nbRules = nbRules;
            },
            onUpdateHitsCount: function (event) {
                this.nbHits = event;
            },
            onUpdateChecksCount: function (event) {
                this.nbChecks = event;
            },
            triggerSearch: async function () {
                const index = await this.getSearchIndex();
                const query = this.searchParamsWithDefaults.query;

                index.search(this.searchParamsWithDefaults).then((res) => {
                    if (res.query !== query) return;
                    this.algoliaResponse = Object.freeze(res);
                    this.errorMessage = '';
                    this.onUpdateHitsCount(this.algoliaResponse.nbHits);

                    if (this.anchor) {
                        Vue.nextTick(() => {
                            goToAnchor(this.anchor);
                            this.anchor = null;
                        });
                    }
                }).catch((e) => {
                    this.algoliaResponse = null;
                    this.errorMessage = e.message;
                });
            },
            triggerAnalyseSearch: async function () {
                const index = await this.getSearchIndex();
                index.search(this.searchParamsForAnalysis).then((res) => {
                    if (res.query !== this.query) return;
                    this.panelAlgoliaResponse = Object.freeze(res);
                }).catch(() => {
                });
            },
            loadIndexSettings: async function () {
                const client = await this.getClient();
                client._jsonRequest({
                    method: 'GET',
                    url: '/1/indexes/' + encodeURIComponent(this.panelIndexName) + '/settings?getVersion=2&advanced=1',
                    body: {},
                    hostType: 'read',
                    callback: (err, indexSettings) => {
                        const settings = {};
                        const advancedSettings = {};
                        let key;
                        for (key in indexSettings) {
                            if (key === 'version') continue;
                            if (key === 'userData') continue;
                            if (this.advancedIndexSettingsNames.indexOf(key) !== -1) {
                                advancedSettings[key] = indexSettings[key];
                                continue;
                            }

                            if (paramsSpecs[key] === undefined
                                || paramsSpecs[key].settings_default === undefined
                                || JSON.stringify(indexSettings[key]) !== JSON.stringify(paramsSpecs[key].settings_default)
                            ) {
                                if (paramsSpecs[key] === undefined || paramsSpecs[key].ignore_value === undefined
                                    || JSON.stringify(indexSettings[key]) !== JSON.stringify(paramsSpecs[key].ignore_value)
                                ) {
                                    settings[key] = indexSettings[key];
                                }
                            }
                        }

                        this.$store.commit(`${this.panelIndexCommitPrefix}/replaceIndexSettings`, settings);
                        this.$store.commit(`${this.panelIndexCommitPrefix}/setAdvancedIndexSettings`, advancedSettings);
                    }
                });
            },
            loadKeysIndexer: async function () {
                const analyze = await analyseIndex(this.panelAppId, this.panelAdminAPIKey, this.panelIndexName);
                const keysIndexer = new searchIndexer();
                analyze.keys.forEach(function (key) {
                    keysIndexer.addString(key);
                });

                this.$store.commit(`${this.panelIndexCommitPrefix}/setIndexAnalyzer`, analyze);
                this.$store.commit(`${this.panelIndexCommitPrefix}/setKeysIndexer`, keysIndexer);
            }
        },
    }
</script>