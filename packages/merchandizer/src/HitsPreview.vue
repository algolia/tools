<template>
    <div>
        <error-message
            v-if="errorMessage"
            :error-message="errorMessage"
            :app-id="appId"
            :api-key="apiKey"
            @onUpdateApiKey="onUpdateApiKey"
        />
        <perform-search
            v-if="indexData"
            :app-id="appId"
            :api-key="apiKey"
            :index-name="indexName"
            method="search"
            :search-params="params"
            :query="query"
            :title-attribute-name="indexTitleAttribute"
            :fetch-explain="false"
            :fetchFacets="true"
            :analyse-hits-per-page="0"
            @onUpdateAutoTitleAttributeName="indexAutoTitleAttributeName = $event"
            @onFetchHits="onFetchHits"
            @onUpdateError="errorMessage = $event"
        />
        <div class="flex">
            <facets
                v-if="indexData"
                class="mr-24"
                :app-id="appId"
                :index-name="indexName"
                :search-params="searchParams || {}"
                :index-settings="indexSettings"
                :query="query"
                :config-key="searchConfigKey"
                panel-key="leftPanel"
            />
            <div v-if="indexData && searchResponse">
                <div class="w-full flex flex-wrap">
                    <template v-for="(hit, i) in searchResponse.hits">
                        <div
                            v-if="bannersPerPosition[i]"
                            class="mt-24"
                            :style="`width: calc(100% / ${config.gridSize} * ${bannersPerPosition[i].size})`"
                        >
                            <img
                                :src="bannersPerPosition[i].image_url"
                                :style="`max-height: ${bannersPerPosition[i].height}px;`"
                                class="w-full"
                            />
                        </div>
                        <merchandize-hit
                            :style="`width: calc(100% / ${config.gridSize})`"
                            :search-response="searchResponse"
                            :hit="hit"
                            :hit-position="i"
                            :config="config"
                        />
                    </template>
                </div>
                <div class="flex justify-center">
                    <pagination
                        :page="searchResponse.page"
                        :cursor="searchResponse.cursor"
                        :nb-pages="searchResponse.nbPages"
                        @onUpdatePage="page = $event"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Results from "common/components/explorer/results/Results";
    import PerformSearch from "common/components/explorer/results/PerformSearch";
    import ErrorMessage from "common/components/explorer/results/ErrorMessage";
    import Pagination from "common/components/explorer/results/Pagination";
    import Facets from "common/components/explorer/facets/Facets";

    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import MerchandizeHit from "./MerchandizeHit";

    export default {
        name: 'HitsPreview',
        components: {MerchandizeHit, Results, PerformSearch, ErrorMessage, Pagination, Facets},
        mixins: [indexInfoMixin],
        props: ['appId', 'indexName', 'apiKey', 'query', 'config'],
        data: function () {
            return {
                searchResponse: null,
                analyseResponse: null,
                errorMessage: null,
                displayMode: 'list',
                panelKey: 'leftPanel',
                searchConfigKey: 'searchParams',
                page: 0,
            }
        },
        computed: {
            params: function () {
                return {...this.config.defaultSearchParams, page: this.page};
            },
            bannersPerPosition: function () {
                const bannersPerPosition = {};

                (this.searchResponse.userData || []).forEach((userData) => {
                    if (userData.cms && Array.isArray(userData.cms.banner)) {
                        userData.cms.banner.forEach((bloc) => {
                            bannersPerPosition[bloc.position - 1] = bloc;
                        });
                    }
                });

                return bannersPerPosition;
            }
        },
        methods: {
            onFetchHits: function (algoliaResponse) {
                this.$root.$emit(`leftPanelUpdateResponse`, algoliaResponse);
                this.searchResponse = algoliaResponse;
            },
            onUpdateApiKey: function (apiKey) {
                this.$store.commit(`apps/${this.appId}/setKey`, {
                    keyName: 'key',
                    value: apiKey,
                });
            },
        }

    }
</script>
