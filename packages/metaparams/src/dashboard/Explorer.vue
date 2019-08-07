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
        <perform-search
            :search-params="searchParams"
            :search-params-raw="searchParamsRaw"
            :app-id="panelAppId"
            :api-key="panelAdminAPIKey"
            :server="panelServer"
            :index-name="panelIndexName"
            :query="query"
            @onFetchHits="onFetchHits"
            @onUpdateAlgoliaResponse="algoliaResponse = $event"
            @onUpdateError="errorMessage = $event"
            @onUpdateAnalyseAlgoliaResponse="analyseAlgoliaResponse = $event"
        />
        <div v-if="algoliaResponse" class="p-8">
            <results v-show="panelCurrentTab === 'hits'" :algolia-response="algoliaResponse" :analyse-algolia-response="analyseAlgoliaResponse"
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
    import {formatHumanNumber} from 'common/utils/formatters'

    import Results from "common/components/explorer/results/Results";
    import Fetcher from "common/components/explorer/synonyms-rules/Fetcher";
    import Checks from "common/components/explorer/checks/Checks";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import panelsMixin from "common/mixins/panelsMixin";
    import PerformSearch from "@/dashboard/PerformSearch";

    export default {
        name: 'Explorer',
        components: {PerformSearch, Checks, Fetcher, Results},
        props: ['panelKey'],
        mixins: [indexInfoMixin, panelsMixin],
        data: function () {
            return {
                nbHits: 0,
                nbRules: 0,
                nbSynonyms: 0,
                nbChecks: 0,
                algoliaResponse: null,
                analyseAlgoliaResponse: null,
                errorMessage: '',
                anchor: null,
            };
        },
        watch: {
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
            },
            onUpdateChecksCount: function (event) {
                this.nbChecks = event;
            },
        },
    }
</script>