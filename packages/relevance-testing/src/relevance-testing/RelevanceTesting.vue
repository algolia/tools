<template>
    <div class="min-h-screen pb-24">
        <app-header app-name="Relevance Testing">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
        <div class="flex">
            <div class="w-25p">
                <div class="border-proton-grey-opacity-60 p-16">
                    <div class="rounded border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                        <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center">
                            <div>{{testSuite.name}}</div>
                            <badge class="ml-auto mr-16" :passing="testSuite.passing" />
                            <div @click="testSuite.run(appId, apiKey, indexName, hitsPerPage)">Run</div>
                        </div>
                        <div class="flex">
                            <app-selector v-model="appId" />
                            <index-selector v-model="indexName" :app-id="appId" class="ml-16" />
                        </div>
                    </div>
                    <div v-for="group in testSuite.groups" :key="group.name" class="bg-white rounded mt-16 border border-proton-grey-opacity-60">
                        <div class="flex p-8 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                            {{group.name}}
                            <badge class="ml-auto mr-16" :passing="group.passing" />
                            <div @click="group.run(appId, apiKey, indexName, hitsPerPage)">Run</div>
                        </div>
                        <div v-for="test in group.tests" :key="test.name">
                            <div class="flex p-8" @click="currentTest = test">
                                <div class="mr-16">{{test.testData.name}}</div>
                                <badge class="ml-auto mr-16" :passing="test.passing" />
                                <div @click.prevent="test.run(appId, apiKey, indexName, hitsPerPage)">Run</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-75p" v-if="appId && indexName && currentTest">
                <div class="rounded bg-white m-16 border border-solid border-proton-grey-opacity-60">
                    <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                        {{currentTest.testData.name}}
                    </div>
                    <div class="flex">
                        <div class="min-w-third max-w-third border-r border-proton-grey ">
                            <test-edit
                                :test="currentTest"
                                @onUpdatedTestData="currentTest.run(appId, apiKey, indexName, hitsPerPage)"
                            />
                        </div>
                        <div class="min-w-two-third max-w-two-third bg-white p-8">
                            <error-message
                                v-if="errorMessage"
                                :error-message="errorMessage"
                                :app-id="appId"
                                :api-key="apiKey"
                                @onUpdateApiKey="panelAdminAPIKey = $event"
                            />
                            <perform-search
                                :search-params="currentTest.testData.when"
                                :app-id="appId"
                                :api-key="apiKey"
                                :index-name="indexName"
                                query=""
                                :fetch-explain="$store.state.panels.displayRankingInfo"
                                :analyse-hits-per-page="maxNbPoints"
                                @onFetchHits="searchResponse = $event"
                                @onFetchAnalyseHits="analyseResponse = $event"
                                @onUpdateError="errorMessage = $event"
                            />
                            <results
                                v-if="panelIndexData"
                                :search-response="searchResponse"
                                :analyse-response="analyseResponse"
                                :search-params="currentTest.testData.when"
                                :index-settings="refIndexSettings"
                                :analyse-max-nb-points="maxNbPoints"
                                :read-only="true"
                                :app-id="appId"
                                :api-key="apiKey"
                                :index-name="indexName"
                                :query="currentTest.testData.when.query !== undefined ? currentTest.testData.when.query : ''"
                                :display-mode="displayMode"
                                :showSearchableAttributes="$store.state.panels.showSearchableAttributes"
                                :showCustomRanking="$store.state.panels.showCustomRanking"
                                :showAttributesForFaceting="$store.state.panels.showAttributesForFaceting"
                                :showOnlyMatchingAttributes="$store.state.panels.showOnlyMatchingAttributes"
                                :can-jump-rules="false"
                                :can-jump-records="false"
                                :image-size="panelImageSize"
                                :image-attribute="panelImageAttributeName"
                                :image-base-url="panelImageBaseUrl"
                                :image-suffix-url="panelImageSuffixUrl"
                                :title-attribute-name="panelTitleAttribute"
                                :auto-title-attribute-name="panelAutoTitleAttributeName"
                                :keys-indexer="panelKeysIndexer"
                                :display-ranking-info="$store.state.panels.displayRankingInfo"
                                @onUpdateAnalyseMaxNbPoint="maxNbPoints = $event"
                                @onUpdateDisplayMode="displayMode = $event"
                                @onUpdatePage="onUpdatePage"
                                @onUpdateImageAttribute="panelImageAttributeName = $event"
                                @onUpdateImageBaseUrl="panelImageBaseUrl = $event"
                                @onUpdateImageSuffixUrl="panelImageSuffixUrl = $event"
                                @onUpdateImageSize="panelImageSize = $event"
                                @onUpdateTitleAttributeName="panelTitleAttribute = $event"
                                @onUpdateAutoTitleAttributeName="panelAutoTitleAttributeName = $event"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppHeader from "common/components/header/AppHeader";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import AppManagement from "common/components/configuration/AppManagement";
    import Results from "common/components/explorer/results/Results";
    import PerformSearch from "common/components/explorer/results/PerformSearch";
    import ErrorMessage from "common/components/explorer/results/ErrorMessage";
    import DisplayConfig from "@/relevance-testing/DisplayConfig";
    import {TestSuite} from "@/relevance-testing/testing/tests";
    import Badge from "@/relevance-testing/Badge";
    import TestEdit from "@/relevance-testing/test-edit/TestEdit"
    import data from "@/relevance-testing/data";

    import indexInfoMixin from "common/mixins/indexInfoMixin";


    export default {
        name: 'RelevanceTesting',
        components: {TestEdit, Badge, DisplayConfig, AppHeader, AppSelector, AppManagement, IndexSelector, CustomSelect, Results, PerformSearch, ErrorMessage},
        mixins: [indexInfoMixin],
        data: function () {
            const testSuite = new TestSuite(data);
            const apps = Object.keys(this.$store.state.apps);
            return {
                appId: apps[0],
                indexName: null,
                testSuite: testSuite,
                searchResponse: null,
                analyseResponse: null,
                errorMessage: null,
                maxNbPoints: 100,
                hitsPerPage: 8,
                currentTest: testSuite.groups[0].tests[0],
                requestNumber: 0,
                requestNumberReceived: 0,
                displayMode: 'list',
                panelKey: 'leftPanel',
            };
        },
        computed: {
            apiKey: {
                get () {
                    return this.$store.state.apps[this.panelAppId].key;
                },
                set (value) {
                    this.$store.commit("apps/addAppId", { appId: this.panelAppId, apiKey: value });
                }
            },
        },
        methods: {
            onUpdatePage: function (val) {
                this.$set(this.currentTest.when, 'page', val);
            }
        }
    }
</script>