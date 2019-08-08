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
        <div class="p-8">
            <perform-search
                :search-params="searchParams"
                :search-params-raw="searchParamsRaw"
                :app-id="panelAppId"
                :api-key="panelAdminAPIKey"
                :server="panelServer"
                :index-name="panelIndexName"
                @onFetchHits="onFetchHits"
                @onUpdateAlgoliaResponse="algoliaResponse = $event"
                @onUpdateError="errorMessage = $event"
                @onUpdateAnalyseAlgoliaResponse="onUpdateAnalyseAlgoliaResponse"
            />
            <error-message v-if="errorMessage" :error-message="errorMessage" />
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
                 :query="searchParams.query !== undefined ? searchParams.query : $store.state.panels.query"
                 :display-mode="displayMode"
                 @onFetchHits="onFetchHits"
                 @onFetchAnalyseHits="onFetchAnalyseHits"
                 @onUpdateAnalyseMaxNbPoint="analyseMaxNbPoints = $event"
                 @onUpdateDisplayMode="displayMode = $event"
            />
            <fetcher v-show="panelCurrentTab === 'synonyms'" :panel-key="panelKey" method-name="searchSynonyms"
                 @onFetch="onFetchSynonyms"/>
            <fetcher v-show="panelCurrentTab === 'rules'" :panel-key="panelKey" method-name="searchRules"
                 @onFetch="onFetchRules"/>
            <checks v-show="panelCurrentTab === 'checks'" :panel-key="panelKey" @onUpdateCount="onUpdateChecksCount"/>
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
            onUpdateAnalyseAlgoliaResponse: function (algoliaResponse) {
                this.analyseAlgoliaResponse = algoliaResponse;
                this.$emit('onFetchAnalyseHits', algoliaResponse);
            },
            onFetchAnalyseHits: function (algoliaResponse) {
                this.$root.$emit(`${this.panelKey}UpdateAnalyseResponse`, algoliaResponse);
            },
            onUpdateChecksCount: function (event) {
                this.nbChecks = event;
            },
        },
    }
</script>