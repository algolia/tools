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
                <div class="w-full">
                    <draggable
                        v-model="hits"
                        @start="drag = true"
                        @end="drag = false"
                        @change="onDrag"
                        class="w-full grid flex-wrap"
                        draggable=".dragitem"
                        :style="`grid-template-columns: repeat(${config.gridSize}, ${100/config.gridSize}%); grid-template-rows: repeat(auto, auto)`"
                        v-bind="{ animation: 200 }"
                    >
                        <div
                            v-for="(hit, i) in hits"
                            :key="hit.objectID"
                            class="dragitem"
                            style="grid-area: auto / auto / auto / span 1"
                        >
                            <merchandize-hit
                                :search-response="searchResponse"
                                :hit="hit"
                                :hit-position="i"
                                :config="config"
                            />
                        </div>
                        <template slot="header">
                            <div
                                v-for="(banner, i) in bannersPerPosition"
                                :key="`banner-${i}`"
                                :style="`grid-area: ${banner.position_y} / ${banner.position_x} / span ${banner.size_y} / span ${banner.size_x}`"
                                class="px-8 py-24"
                            >
                                <img
                                    :src="banner.image_url"
                                    class="w-full h-full"
                                />
                            </div>
                        </template>
                    </draggable>
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

    import draggable from "vuedraggable";

    export default {
        name: 'HitsPreview',
        components: {MerchandizeHit, Results, PerformSearch, ErrorMessage, Pagination, Facets, draggable},
        mixins: [indexInfoMixin],
        props: ['appId', 'indexName', 'apiKey', 'query', 'context', 'config'],
        data: function () {
            return {
                searchResponse: null,
                analyseResponse: null,
                errorMessage: null,
                displayMode: 'list',
                panelKey: 'leftPanel',
                searchConfigKey: 'searchParams',
                page: 0,
                drag: false,
            }
        },
        computed: {
            params: function () {
                return {
                    ...this.config.defaultSearchParams,
                    page: this.page,
                    ruleContexts: this.context || undefined,
                    facetFilters: this.searchParams.facetFilters || [],
                };
            },
            bannersPerPosition: function () {
                const bannersPerPosition = {};

                (this.searchResponse.userData || []).forEach((userData) => {
                    if (userData.cms && Array.isArray(userData.cms.banner)) {
                        userData.cms.banner.forEach((bloc) => {
                            bannersPerPosition[(bloc.position_y - 1) * this.config.gridSize - (bloc.position_x - 1)] = bloc;
                        });
                    }
                });

                return bannersPerPosition;
            },
            hits: {
                get () {
                    return this.searchResponse.hits;
                },
                set () {}
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
            onDrag: function ($event) {
                if ($event.moved && $event.moved.element && $event.moved.element.objectID) {
                    this.$root.$emit('onWantToPromoteAtPosition', {
                       objectID: $event.moved.element.objectID,
                       position: $event.moved.newIndex,
                    });
                }
            }
        }

    }
</script>
