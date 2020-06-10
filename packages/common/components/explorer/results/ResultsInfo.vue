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
        </template>
        <template v-else>
            <h4 class="text-center">Currently in Browse mode</h4>
        </template>
    </div>
</template>

<script>
    import {humanNumber} from '../../../../common/utils/formatters';

    export default {
        name: 'ResultsInfo',
        props: ['searchResponse', 'searchParams', 'appId', 'apiKey'],
        data: function () {
            return {
                userPersoFilters: false,
                showAllFilters: false,
                nbShowFilters: 5,
            }
        },
        watch: {
            userToken: async function () { await this.fetchPersoProfil(); },
            enablePersonalization: async function () { await this.fetchPersoProfil(); },
        },
        created: async function () {
            await this.fetchPersoProfil();
        },
        computed: {
            shownFilters: function () {
                const filters = this.userPersoFilters || [];
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
