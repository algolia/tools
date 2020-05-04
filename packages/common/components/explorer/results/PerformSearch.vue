<template>
    <settings-loader
        :app-id="appId"
        :index-name="indexName"
        :api-key="apiKey"
        :user-id="userId"
        @onFetchSettings="indexSettings = $event"
    />
</template>

<script>
    import RankingInfoAnalyser from "common/components/explorer/hits/rankingInfoAnalyser"
    import {cleanAttributeName} from 'common/utils/formatters';
    import {getSearchIndex} from 'common/utils/algoliaHelpers';

    import {goToAnchor} from "common/utils/domHelpers";
    import titleAttribute from "../../../mixins/titleAttribute";
    import SettingsLoader from "./SettingsLoader";

    export default {
        components: {SettingsLoader},
        props: [
            'appId', 'indexName', 'apiKey', 'server', 'query', 'method', 'userId',
            'noSignature',
            'searchParams',
            'titleAttributeName',
            'fetchExplain',
            'analyseHitsPerPage',
            'fetchFacets'
        ],
        mixins: [titleAttribute],
        data: function () {
            return {
                anchor: null,
                searchResponse: null,
                indexSettings: {},
                requestNumber: 0,
                requestNumberReceived: 0,
                requestNumberAnalysis: 0,
                requestNumberAnalysisReceived: 0,
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
            server: function (o, n) { if (o !== n) this.init(); },
            method: function (o, n) { if (o !== n) this.init(); },
            searchParamsWithDefaults: function (o, n) {
                if (JSON.stringify(o) !== JSON.stringify(n)) this.triggerSearch();
            },
            searchParamsForAnalysis: function (o, n) {
                if (JSON.stringify(o) !== JSON.stringify(n)) this.triggerAnalyseSearch();
            },
            appId: function (o, n) { if (o !== n) this.init() },
            indexName: function (o, n) { if (o !== n) this.init() },
            apiKey: function (o, n) { if (o !== n)  this.init() },
            userId: function (o, n) { if (o !== n) this.init(); },
        },
        computed: {
            rankingInfoAnalyzer: function () {
                return new RankingInfoAnalyser(this.indexSettings);
            },
            criteria: function () {
                return this.rankingInfoAnalyzer.getActualCriteria();
            },
            textualCriteria: function () {
                return this.rankingInfoAnalyzer.getActualCriteria(this.searchParamsWithDefaults, true).filter((criterion) => {
                    return !['perso', 'perso.filtersScore', 'perso.rankingScore'].includes(criterion);
                });
            },
            searchParamsWithDefaults: function () {
                const nonForcedparams = {
                    hitsPerPage: 8,
                    query: this.query,
                    attributesToSnippet: ['*:10'],
                    snippetEllipsisText: '…',
                    attributesToRetrieve: ['*'],
                    responseFields: ['*'],
                    analytics: false,
                    enableABTest: false,
                };

                if (this.fetchExplain) {
                    nonForcedparams['explain'] = 'match.alternatives,params.*';
                }

                const forcedParams = {
                    getRankingInfo: true,
                    highlightPreTag: '<ais-highlight-0000000000>',
                    highlightPostTag: '</ais-highlight-0000000000>',
                };

                if (this.fetchFacets) {
                    const attributesForFaceting = this.indexSettings && this.indexSettings.attributesForFaceting ? this.indexSettings.attributesForFaceting : [];
                    let facets = (this.searchParams.facets || attributesForFaceting || []).slice(0, 50);
                    if (facets.some((facet) => facet === '*')) {
                        facets = attributesForFaceting;
                    }
                    forcedParams.disjunctiveFacets = facets.map(cleanAttributeName);
                }

                return Object.assign(nonForcedparams, this.searchParams, forcedParams);
            },
            searchParamsForAnalysis: function () {
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
                        attributesToRetrieve: ['*'],
                        responseFields: ['*'],
                    },
                )
            },
        },
        methods: {
            init: function () {
                if (!this.appId || !this.indexName) {
                    this.$emit('onFetchHits', null);
                    return;
                }
                this.triggerSearch();
                this.triggerAnalyseSearch();
            },
            triggerSearch: async function () {
                const method = this.method === 'search' ? 'customSearch' : 'customBrowse';

                const requestNumber = this.requestNumber++;
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId, this.noSignature);

                index[method](this.searchParamsWithDefaults).then(async (res) => {
                    if (this.requestNumberReceived > requestNumber) return;
                    this.requestNumberReceived = requestNumber;

                    if (res.hits.length <= 0 && this.searchParamsWithDefaults.query.length > 0) {
                        try {
                            res.object = await index.getObject(this.searchParamsWithDefaults.query);
                        } catch (e) {}
                    }

                    if (res.merge && res.hits.length > 0 && res.hits[0]._rankingInfo) {
                        res.hits[0]._rankingInfo.merge = res.merge;
                    }

                    const response = Object.freeze(res);
                    this.searchResponse = response;
                    this.$emit('onFetchHits', response);
                    this.$emit('onUpdateError', '');

                    if (this.anchor) {
                        this.$nextTick(() => {
                            goToAnchor(this.anchor);
                            this.anchor = null;
                        });
                    }
                }).catch((e) => {
                    if (this.requestNumberReceived > requestNumber) return;
                    this.requestNumberReceived = requestNumber;

                    this.$emit('onFetchHits', null);
                    this.$emit('onUpdateError', e.message);
                    console.error(e);
                });
            },
            triggerAnalyseSearch: async function () {
                const method = this.method === 'search' ? 'customSearch' : 'customBrowse';
                if (method !== 'customSearch') {
                    this.$emit('onFetchAnalyseHits', null);
                    return;
                }

                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId, this.noSignature);
                const requestNumberAnalysis = this.requestNumberAnalysis++;

                index[method](this.searchParamsForAnalysis).then((res) => {
                    if (this.requestNumberAnalysisReceived > requestNumberAnalysis) return;
                    this.requestNumberAnalysisReceived = requestNumberAnalysis;

                    if (res.hits.length > 1) {
                        let currentRelevanceSignature = JSON.stringify(this.textualCriteria.map((criterion) => this.rankingInfoAnalyzer.getCriterionValue(res.hits[0], criterion)));
                        for (let i = 1; i < res.hits.length; i++) {
                            const relevanceSignature = JSON.stringify(this.textualCriteria.map((criterion) => this.rankingInfoAnalyzer.getCriterionValue(res.hits[i], criterion)));
                            if (currentRelevanceSignature !== relevanceSignature) {
                                currentRelevanceSignature = relevanceSignature;
                                res.hits[i]._rankingInfo.startsRelevanceBucket = true;
                            }
                        }
                    }

                    this.$emit('onFetchAnalyseHits', Object.freeze(res));
                }).catch(() => {
                });
            },
        }
    }
</script>
