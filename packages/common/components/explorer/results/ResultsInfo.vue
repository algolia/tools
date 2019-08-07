<template>
    <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8">
        <div class="flex justify-between">
            <div>
                <div>{{humanNumber(algoliaResponse.nbHits)}} hits in {{algoliaResponse.processingTimeMS}}ms.</div>
                <div>Exhaustive Nb Hits: {{algoliaResponse.exhaustiveNbHits}}</div>
                <div>Exhaustive Facets: {{algoliaResponse.exhaustiveFacetsCount === undefined ? true : algoliaResponse.exhaustiveFacetsCount }}</div>
            </div>
            <div>
                <div>Index Used: {{algoliaResponse.indexUsed}}</div>
                <div>Parsed query: "{{algoliaResponse.parsedQuery}}"</div>
                <div>Server Used: {{algoliaResponse.serverUsed}}</div>
            </div>
        </div>
        <div v-if="persoProfile" class="mt-16">
            user perso profile:
            <template v-for="(facetValues, facetName) in persoProfile.scores">
                <span v-for="(facetScore, facetValue) in facetValues">
                    {{facetName}}:{{facetValue}}&lt;score={{facetScore}}&gt;
                </span>
            </template>
        </div>
    </div>
</template>

<script>
    import {humanNumber} from '../../../../common/utils/formatters';
    import indexInfoMixin from "../../../mixins/indexInfoMixin";

    export default {
        name: 'ResultsInfo',
        props: ['panelKey', 'algoliaResponse'],
        mixins: [indexInfoMixin],
        data: function () {
            return {
                region: 'us',
                persoProfile: false,
            }
        },
        watch: {
            userToken: function () { this.fetchPersoProfil(); },
            enablePersonalization: function () { this.fetchPersoProfil(); },
        },
        mounted: function () {
            this.fetchPersoProfil();
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
                    this.persoProfile = false;
                    return;
                }

                const persoProfileQuery = await fetch(`https://recommendation.${this.region}.algolia.com/1/profiles/personalization/${this.userToken}`, {
                    headers: {
                        'X-Algolia-Application-Id': this.panelAppId,
                        'X-Algolia-API-Key': this.panelAdminAPIKey,
                    }
                });

                if (!persoProfileQuery.ok) {
                    if (this.region !== 'eu') {
                        this.region = 'eu';
                        this.fetchPersoProfil();
                        return;
                    }
                    this.persoProfile = false;
                    return;
                }

                this.persoProfile = await persoProfileQuery.json();
            }
        },
    }
</script>