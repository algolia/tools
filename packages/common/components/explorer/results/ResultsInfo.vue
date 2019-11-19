<template>
    <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8">
        <div class="flex justify-between">
            <div>
                <div>{{humanNumber(searchResponse.nbHits)}} hits in {{searchResponse.processingTimeMS}}ms.</div>
                <div>Exhaustive Nb Hits: {{searchResponse.exhaustiveNbHits}}</div>
                <div>Exhaustive Facets: {{searchResponse.exhaustiveFacetsCount === undefined ? true : searchResponse.exhaustiveFacetsCount }}</div>
            </div>
            <div>
                <div>Index Used: {{searchResponse.indexUsed}}</div>
                <div>Parsed query: "{{searchResponse.parsedQuery}}"</div>
                <div>Server Used: {{searchResponse.serverUsed}}</div>
            </div>
        </div>
        <div v-if="userToken" class="mt-16">
            <div>user perso profile:</div>
            <div v-if="userPersoFilters">
                <div>
                    <template v-for="persoFilter in userPersoFilters">
                        {{persoFilter}}
                    </template>
                </div>
                <div>
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
        <div v-if="userToken && userPersoFiltersV2" class="mt-16">
            <div>user perso profile v2:</div>
            <div v-if="userPersoFiltersV2">
                <div>
                    <template v-for="persoFilter in userPersoFiltersV2">
                        {{persoFilter}}
                    </template>
                </div>
                <div>
                    <button
                        @click="$emit('onSetParamValue', 'personalizationFilters', userPersoFiltersV2)"
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
    </div>
</template>

<script>
    import {humanNumber} from '../../../../common/utils/formatters';

    export default {
        name: 'ResultsInfo',
        props: ['searchResponse', 'searchParams', 'appId', 'apiKey'],
        data: function () {
            return {
                region: 'us',
                userPersoFilters: false,
                userPersoFiltersV2: false,
            }
        },
        watch: {
            userToken: async function () { await this.fetchPersoProfil(); this.fetchPersoProfilV2(); },
            enablePersonalization: async function () { await this.fetchPersoProfil(); this.fetchPersoProfilV2(); },
        },
        created: async function () {
            await this.fetchPersoProfil();
            this.fetchPersoProfilV2();
        },
        computed: {
            userToken: function () {
                return this.searchParams.userToken;
            },
            enablePersonalization: function () {
                return this.searchParams.enablePersonalization;
            }
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
                    if (this.region !== 'eu') {
                        this.region = 'eu';
                        const valid = await this.fetchPersoProfil();
                        if (!valid) this.region = 'us';
                        return valid;
                    }
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
            fetchPersoProfilV2: async function () {
                if (!this.enablePersonalization || !this.userToken) {
                    this.userPersoFiltersV2 = false;
                    return;
                }

                const persoProfileQuery = await fetch(`https://recommendation.${this.region}.algolia.com/2/profiles/personalization/${this.userToken}`, {
                    headers: {
                        'X-Algolia-Application-Id': this.appId,
                        'X-Algolia-API-Key': this.apiKey,
                    }
                });

                if (!persoProfileQuery.ok) {
                    this.userPersoFiltersV2 = false;
                    return false;
                }

                const fetchedProfile = await persoProfileQuery.json();

                const profile = [];
                Object.keys(fetchedProfile.scores).forEach((facetName) => {
                    Object.keys(fetchedProfile.scores[facetName]).forEach((facetValue) => {
                        profile.push([`${facetName}:${facetValue}`, fetchedProfile.scores[facetName][facetValue]]);
                    });
                });

                this.userPersoFiltersV2 = profile.sort((a, b) => {
                    return b[1] - a[1];
                }).map((profile) => {
                    return `${profile[0]}<score=${profile[1]}>`;
                });
                return true;
            }
        },
    }
</script>
