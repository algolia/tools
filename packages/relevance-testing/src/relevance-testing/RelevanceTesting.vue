<template>
    <div class="min-h-screen pb-24">
        <app-header app-name="Relevance Testing">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
        <div class="flex">
            <div class="w-half flex">
                <div class="w-half p-16">
                    <div class="border-proton-grey-opacity-60">
                        <div>
                            <app-selector v-model="appId" />
                            <index-selector v-model="indexName" :app-id="appId" />
                        </div>
                        <div class="rounded text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                            <div>{{testSuite.name}}</div>
                            <badge class="ml-auto mr-16" :passing="testSuite.passing" />
                            <div @click="testSuite.run(algoliaIndex, hitsPerPage)">Run</div>
                        </div>
                        <div v-for="group in testSuite.groups" :key="group.name" class="bg-white rounded mt-16 border border-proton-grey-opacity-60">
                            <div class="flex p-8 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                                {{group.name}}
                                <badge class="ml-auto mr-16" :passing="group.passing" />
                                <div @click="group.run(algoliaIndex, hitsPerPage)">Run</div>
                            </div>
                            <div v-for="test in group.tests" :key="test.name">
                                <div class="flex p-8" @click="currentTest = test">
                                    <div class="mr-16">{{test.name}}</div>
                                    <badge class="ml-auto mr-16" :passing="test.passing" />
                                    <div @click.prevent="test.run(algoliaIndex, hitsPerPage)">Run</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <test-edit v-if="currentTest" :test="currentTest" class="flex-grow" />
            </div>
            <div class="w-half p-16">
                <div class="w-full bg-white p-8">
                    <results v-if="panelIndexData && algoliaResponse" :algolia-response="algoliaResponse" :panel-key="panelKey"/>
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
    import DisplayConfig from "@/relevance-testing/DisplayConfig";
    import {TestSuite} from "@/relevance-testing/testing/tests";
    import Badge from "@/relevance-testing/Badge";
    import TestEdit from "@/relevance-testing/TestEdit"
    import data from "@/relevance-testing/data";

    import indexMixin from "common/mixins/indexMixin";

    export default {
        name: 'RelevanceTesting',
        components: {TestEdit, Badge, DisplayConfig, AppHeader, AppSelector, AppManagement, IndexSelector, CustomSelect, Results},
        mixins: [indexMixin],
        data: function () {
            return {
                testSuite: new TestSuite(data),
                hitsPerPage: 8,
                currentTest: null,
                algoliaResponse: null,
                errorMessage: '',
                requestNumber: 0,
                requestNumberReceived: 0,
                panelKey: 'leftPanel',
            };
        },
        created: function () {
            this.triggerSearch();
        },
        computed: {
            algoliaIndex: function () {
                const client = this.algoliasearch('AJ0P3S7DWQ', 'ce1181300d403d21311d5bca9ef1e6fb', {_useCache: false});
                return client.initIndex('movies');
            },
            appId: {
                get () {
                    return this.$store.state.panels.leftPanel.appId;
                },
                set (appId) {
                    this.$store.commit(`panels/leftPanel/setPanelConfig`, {appId: appId, indexName: null});
                }
            },
            indexName: {
                get () {
                    return this.$store.state.panels.leftPanel.indexName;
                },
                set (indexName) {
                    this.$store.commit(`panels/leftPanel/setPanelConfig`, {appId: this.appId, indexName: indexName});
                }
            },
        },
        methods: {
            triggerSearch: async function () {
                const requestNumber = this.requestNumber++;

                this.algoliaIndex.search({query: 'london'}).then((res) => {
                    if (this.requestNumberReceived > requestNumber) return;
                    this.requestNumberReceived = requestNumber;

                    this.algoliaResponse = Object.freeze(res);
                    this.errorMessage = '';
                }).catch((e) => {
                    this.algoliaResponse = null;
                    this.errorMessage = e.message;
                });
            }
        }
    }
</script>