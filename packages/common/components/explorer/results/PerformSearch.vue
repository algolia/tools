<template>
    <div></div>
</template>

<script>
    import searchIndexer from 'common/local-search-engine/dumbIndexer';
    import analyseIndex from 'common/utils/indexAnalyzer';
    import paramsSpecs from 'common/params-specs';
    import RankingInfoAnalyser from "common/components/explorer/hits/rankingInfoAnalyser"
    import {cleanAttributeName} from 'common/utils/formatters';
    import {getClient, getSearchIndex} from 'common/utils/algoliaHelpers';

    import {goToAnchor} from "common/utils/domHelpers";

    export default {
        props: [
            'appId', 'indexName', 'apiKey', 'query',
            'searchParams',
            'fetchExplain', 'analyseHitsPerPage',
        ],
        data: function () {
            return {
                anchor: null,
                indexSettings: {},
                requestNumber: 0,
                requestNumberReceived: 0,
                requestNumberAnalysis: 0,
                requestNumberAnalysisReceived: 0,
                advancedIndexSettingsNames: ['indexingGeolocPrecision','maxNbHits','nbShards','nbShardsAuto','approxSubstIsBetter','maxApproxIVSizeForEachWord','maxApproxWords'],
            }
        },
        created: async function () {
            this.init();
            this.$root.$on('shouldTriggerSearch', (indexName) => {
                if (indexName === this.indexName) {
                    this.triggerSearch();
                    this.triggerAnalyseSearch();
                }
            });

            this.$root.$on('wantsToGoToAnchorAtNext', (anchor) => {
                this.anchor = anchor;
            });
        },
        watch: {
            query: function () {
                ['searchParams', 'searchParams2'].forEach((key) => {
                    this.$store.commit(`apps/${this.appId}/${this.indexName}/deleteParam`, {
                        configKey: key,
                        inputKey: 'page'
                    });
                });
            },
            server: function (o, n) {
                if (o !== n) this.triggerSearch();
            },
            searchParamsWithDefaults: function (o, n) {
                if (JSON.stringify(o) !== JSON.stringify(n)) this.triggerSearch();
            },
            searchParamsForAnalysis: function (o, n) {
                if (JSON.stringify(o) !== JSON.stringify(n)) this.triggerAnalyseSearch();
            },
            appId: function (o, n) { if (o !== n) this.init() },
            indexName: function (o, n) { if (o !== n) this.init() },
            apiKey: function (o, n) { if (o !== n) this.init() },

        },
        computed: {
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.indexSettings);
            },
            criteria: function () {
                return this.rankingInfoAnalyzer.getActualCriteria();
            },
            searchParamsWithDefaults: function () {
                const nonForcedparams = {
                    hitsPerPage: 8,
                    query: this.query,
                    attributesToSnippet: ['*:10'],
                    snippetEllipsisText: '…',
                    attributesToRetrieve: ['*'],
                };

                if (this.fetchExplain) {
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
            searchParamsForAnalysis: function () {
                const attributesToRetrieve = this.criteria.map((criterion) => {
                    return cleanAttributeName(criterion)
                });
                attributesToRetrieve.push('_geoloc');

                return Object.assign(
                    {
                        query: this.query,
                    },
                    this.searchParams,
                    {
                        page: 0,
                        analytics: false,
                        enableABTest: false,
                        getRankingInfo: true,
                        hitsPerPage: this.analyseHitsPerPage,
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
            triggerSearch: async function () {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server);
                const requestNumber = this.requestNumber++;

                index.customSearch(this.searchParamsWithDefaults).then((res) => {
                    if (this.requestNumberReceived > requestNumber) return;
                    this.requestNumberReceived = requestNumber;

                    this.$emit('onFetchHits', Object.freeze(res));
                    this.$emit('onUpdateError', '');

                    if (this.anchor) {
                        this.$nextTick(() => {
                            goToAnchor(this.anchor);
                            this.anchor = null;
                        });
                    }
                }).catch((e) => {
                    this.$emit('onFetchHits', null);
                    this.$emit('onUpdateError', e.message);
                });
            },
            triggerAnalyseSearch: async function () {
                if (Object.keys(this.indexSettings).length <= 0) return;

                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server);
                const requestNumberAnalysis = this.requestNumberAnalysis++;

                index.customSearch(this.searchParamsForAnalysis).then((res) => {
                    if (this.requestNumberAnalysisReceived > requestNumberAnalysis) return;
                    this.requestNumberAnalysisReceived = requestNumberAnalysis;

                    this.$emit('onFetchAnalyseHits', Object.freeze(res));
                }).catch(() => {
                });
            },
            loadIndexSettings: async function () {
                const client = await getClient(this.appId, this.apiKey);
                client._jsonRequest({
                    method: 'GET',
                    url: '/1/indexes/' + encodeURIComponent(this.indexName) + '/settings?getVersion=2&advanced=1',
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

                        this.indexSettings = settings;
                        this.$store.commit(`apps/${this.appId}/${this.indexName}/replaceIndexSettings`, settings);
                        this.$store.commit(`apps/${this.appId}/${this.indexName}/setAdvancedIndexSettings`, advancedSettings);
                    }
                });
            },
            loadKeysIndexer: async function () {
                if (!this.appId || !this.apiKey);

                const analyze = await analyseIndex(this.appId, this.apiKey, this.indexName);
                const keysIndexer = new searchIndexer();
                analyze.keys.forEach(function (key) {
                    keysIndexer.addString(key);
                });

                this.$store.commit(`apps/${this.appId}/${this.indexName}/setIndexAnalyzer`, analyze);
                this.$store.commit(`apps/${this.appId}/${this.indexName}/setKeysIndexer`, keysIndexer);
            }
        }
    }
</script>