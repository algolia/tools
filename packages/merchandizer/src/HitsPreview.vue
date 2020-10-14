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
                    <draggable v-model="hits" @start="drag = true" @end="drag = false" @change="onDrag" class="w-full">
                        <transition-group type="transition" :name="!drag ? 'flip-list' : null" class="block w-full flex flex-wrap">
                            <div
                                v-for="(hit) in hits"
                                :key="hit.objectID"
                                :style="hit.__style__"
                            >
                                <div v-if="hit.is_banner">
                                    <img
                                        :src="hit.image_url"
                                        :style="`max-height: ${hit.height}px;`"
                                        class="w-full"
                                    />
                                </div>
                                <merchandize-hit
                                    v-else
                                    :search-response="searchResponse"
                                    :hit="hit"
                                    :hit-position="hit.__i__"
                                    :config="config"
                                />
                            </div>
                        </transition-group>
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
                drag: false,
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
            },
            hits: {
                get () {
                    const hits = [];

                    this.searchResponse.hits.forEach((hit, i) => {
                        if (this.bannersPerPosition[i]) {
                            hits.push({
                                is_banner: true,
                                objectID: `banner-${i}`,
                                __style__: `margin-top: 24px; width: calc(100% / ${this.config.gridSize} * ${this.bannersPerPosition[i].size})`,
                                ...this.bannersPerPosition[i],
                            });
                        }

                        hits.push({
                            __style__: `width: calc(100% / ${this.config.gridSize}); max-width: calc(100% / ${this.config.gridSize})`,
                            __i__: i,
                            ...hit,
                        });
                    })
                    return hits;
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
                let newIndex = $event.moved.newIndex;
                for (let i = newIndex; i >= 0; i--) {
                    if (this.bannersPerPosition[i]) {
                        newIndex--;
                    }
                }

                if ($event.moved.element.is_banner) {
                    this.$root.$emit('onWantToMoveBannerAtPosition', {
                        objectID: $event.moved.element.image_url,
                        position: newIndex + 1,
                    });
                } else {
                    this.$root.$emit('onWantToPromoteAtPosition', {
                       objectID: $event.moved.element.objectID,
                       position: newIndex + 1,
                    });
                }
            }
        }

    }
</script>

<style>
    .flip-list-move {
        transition: transform 0.5s;
    }
    .no-move {
        transition: transform 0s;
    }
</style>
