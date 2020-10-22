<template>
    <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8">
        <template v-if="searchResponse.parsedQuery !== undefined">
            <div class="flex justify-between">
                <div>
                    <div>{{humanNumber(searchResponse.nbHits)}} hits in {{searchResponse.processingTimeMS}}ms.</div>
                    <div>Exhaustive Nb Hits: {{searchResponse.exhaustiveNbHits}}</div>
                    <div>Exhaustive Facets: {{searchResponse.exhaustiveFacetsCount === undefined ? true : searchResponse.exhaustiveFacetsCount }}</div>
                </div>
                <div>
                    <div>Index Used: {{searchResponse.indexUsed}}</div>
                    <div>Parsed query: '{{searchResponse.parsedQuery}}'</div>
                    <div>Server Used: {{searchResponse.serverUsed}}</div>
                </div>
            </div>
            <div v-if="userToken" class="mt-24">
                <div class="mb-8 text-sm tracking-wide uppercase">User perso profile:</div>
                <div v-if="shownFilters">
                    <div>
                        <div v-for="persoFilter in shownFilters">
                            {{persoFilter}}
                        </div>
                        <div
                            v-if="userPersoFilters.length > nbShowFilters"
                            class="text-nebula-blue cursor-pointer"
                            @click="showAllFilters = !showAllFilters"
                        >
                            Show {{userPersoFilters.length - nbShowFilters}} {{ showAllFilters ? 'less' : 'more' }}
                        </div>
                        <button
                            @click="$emit('onSetParamValue', 'personalizationFilters', userPersoFilters)"
                            class="mt-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                        >
                            Set perso profile as personalizationFilters
                        </button>
                    </div>
                </div>
                <div v-else>
                    Profile for userToken "{{userToken}}" was not found
                </div>
            </div>
            <div v-if="abTest" class="mt-24">
                <div class="mb-8 text-sm tracking-wide uppercase">
                    Running A/B test detected
                </div>
                <button
                    @click="applyVariantB()"
                    class="mt-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Apply Variant B configuration
                </button>
            </div>
        </template>
        <template v-else>
            <h4 class="text-center">Currently in Browse mode</h4>
        </template>
    </div>
</template>

<script>
    import {humanNumber} from '../../../../common/utils/formatters';
    import {algoliaParams, getClient} from "../../../utils/algoliaHelpers";

    export default {
        name: 'ResultsInfo',
        props: ['searchResponse', 'searchParams', 'appId', 'apiKey', 'indexName', 'panelKey'],
        data: function () {
            return {
                userPersoFilters: false,
                showAllFilters: false,
                nbShowFilters: 5,
                abTest: null,
            }
        },
        watch: {
            userToken: async function () { await this.fetchPersoProfil(); },
            enablePersonalization: async function () { await this.fetchPersoProfil(); },
            abTestId: {
                immediate: true,
                handler: async function () {
                    if (this.abTestId) {
                        const client = await getClient(this.appId, this.apiKey);
                        const analytics = client.initAnalytics();
                        this.abTest = Object.freeze(await analytics.getABTest(this.abTestId));
                    } else {
                        this.abTest = null;
                    }
                }
            }
        },
        created: async function () {
            await this.fetchPersoProfil();
        },
        computed: {
            abTestId: function () {
                if (this.searchResponse && this.searchResponse.abTestID) {
                    return this.searchResponse.abTestID;
                }
                return null;
            },
            shownFilters: function () {
                const filters = this.userPersoFilters || [];
                if (this.showAllFilters) return filters;
                return filters.slice(0, this.nbShowFilters);
            },
            userToken: function () {
                return this.searchParams.userToken;
            },
            enablePersonalization: function () {
                return this.searchParams.enablePersonalization;
            },
            region: function () {
                return this.$store.state.apps[this.appId].__log_region || 'us';
            },
        },
        methods: {
            applyVariantB: function () {
                const otherPanelKey = this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
                const appId = this.$store.state.panels[this.panelKey].appId;
                const indexName = this.$store.state.panels[this.panelKey].indexName;
                const otherAppId = this.$store.state.panels[otherPanelKey].appId;
                const otherIndexName = this.$store.state.panels[otherPanelKey].indexName;
                const isSameIndexOnBothPanels = appId === otherAppId && indexName === otherIndexName;
                const searchConfigKey = isSameIndexOnBothPanels && this.panelKey === 'rightPanel' ? 'searchParams2' : 'searchParams';

                if (this.abTest.variants[1].index === this.indexName) {
                    Object.keys(this.abTest.variants[1].customSearchParameters).forEach((key) => {
                        this.$store.commit(`apps/${this.appId}/${this.indexName}/setParamValue`, {
                            configKey: searchConfigKey,
                            key: key,
                            value: this.abTest.variants[1].customSearchParameters[key],
                        });
                    });

                    this.$store.commit(`apps/${this.appId}/${this.indexName}/setParamValue`, {
                        configKey: searchConfigKey,
                        key: 'enableABTest',
                        value: false,
                    });
                } else {
                    const backupParams = algoliaParams(this.$store.state.apps[this.appId][this.indexName][searchConfigKey]);

                    const newIndexName = this.abTest.variants[1].index;

                    this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {
                        appId: this.appId,
                        indexName: newIndexName,
                    });

                    this.$nextTick(() => {
                        const appId = this.$store.state.panels[this.panelKey].appId;
                        const indexName = this.$store.state.panels[this.panelKey].indexName;
                        const otherAppId = this.$store.state.panels[otherPanelKey].appId;
                        const otherIndexName = this.$store.state.panels[otherPanelKey].indexName;
                        const isSameIndexOnBothPanels = appId === otherAppId && indexName === otherIndexName;
                        const searchConfigKey = isSameIndexOnBothPanels && this.panelKey === 'rightPanel' ? 'searchParams2' : 'searchParams';

                        this.$store.commit(`apps/${this.appId}/${newIndexName}/resetParams`, {
                            configKey: searchConfigKey,
                        });

                        Object.keys(backupParams).forEach((key) => {
                            this.$store.commit(`apps/${this.appId}/${newIndexName}/setParamValue`, {
                                configKey: searchConfigKey,
                                key: key,
                                value: backupParams[key],
                            });
                        });

                        this.$store.commit(`apps/${this.appId}/${newIndexName}/setParamValue`, {
                            configKey: searchConfigKey,
                            key: 'enableABTest',
                            value: false,
                        });
                    });
                }
            },
            humanNumber: humanNumber,
            fetchPersoProfil: async function () {
                if (!this.enablePersonalization || !this.userToken) {
                    this.userPersoFilters = false;
                    return;
                }

                const persoProfileQuery = await fetch(`https://recommendation.${this.region}.algolia.com/1/profiles/personalization/${this.userToken}`, {
                    headers: {
                        'X-Algolia-Application-Id': this.appId,
                        'X-Algolia-API-Key': this.apiKey,
                    }
                });

                if (!persoProfileQuery.ok) {
                    this.userPersoFilters = false;
                    return false;
                }

                const fetchedProfile = await persoProfileQuery.json();

                const profile = [];
                Object.keys(fetchedProfile.scores).forEach((facetName) => {
                    Object.keys(fetchedProfile.scores[facetName]).forEach((facetValue) => {
                        profile.push([`${facetName}:${facetValue}`, fetchedProfile.scores[facetName][facetValue]]);
                    });
                });

                this.userPersoFilters = profile.sort((a, b) => {
                    return b[1] - a[1];
                }).map((profile) => {
                    return `${profile[0]}<score=${profile[1]}>`;
                });
                return true;
            },
        },
    }
</script>
