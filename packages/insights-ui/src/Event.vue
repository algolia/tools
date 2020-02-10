<template>
    <div>
        <div>
            <small-tabs
                :tabs="[{ value: 'click', name: 'Click Analytics' }, { value: 'perso', name: 'Perso' }]"
                v-model="type"
            />
        </div>
        <div v-if="type === 'click'" class="mt-24">
            <div>
                <label>
                    <input v-model="trackQueryInAnalytics" type="checkbox" class="mr-4"> Track queries in Analytics (needed to send click/conversion events)
                </label>
            </div>
            <div class="mt-8 flex items-center px-16 bg-white rounded border border-proton-grey-opacity-80">
                <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
                <input
                    class="flex-1 block h-full py-8 bg-transparent text-telluric-blue leading-normal"
                    placeholder="Search for records"
                    v-model="query"
                >
            </div>
            <div class="mt-8">
                <params
                    class="w-300"
                    :id="`${appId}-${indexName}`"
                    config-key="searchParams"
                    :params="editableParams"
                    :ref-params="editableParams"
                    :raw-params="editableParams"
                    :keys="Object.keys(editableParams)"
                    :keys-indexer="null"
                    :mutate="true"
                    @onMutate="onMutate"
                />
            </div>
            <perform-search
                :search-params="params"
                :app-id="appId"
                :api-key="apiKey"
                :index-name="indexName"
                method="search"
                :query="query"
                :title-attribute-name="indexTitleAttribute"
                :fetch-explain="false"
                :analyse-hits-per-page="0"
                :fetch-facets="false"
                @onUpdateAutoTitleAttributeName="indexAutoTitleAttributeName = $event"
                @onFetchHits="onFetchHits"
                @onUpdateError="errorMessage = $event"
            />
            <div class="mt-40" v-if="searchResponse">
                <div class="text-solstice-blue-opacity-70">
                    Title attribute:
                    <input
                        class="w-128 bg-proton-grey-opacity-20 text-xs p-4"
                        :value="indexTitleAttribute"
                        @input="indexTitleAttribute = $event.target.value"
                        placeholder="attribute_name"/>
                    (default to first string attribute in searchableAttribute)
                </div>
                <div v-for="(hit, i) in searchResponse.hits" class="my-16 relative">
                    <div class="flex items-start">
                        <div
                            class="mr-8 border border-nova-grey-opacity-80 text-center w-24 px-8 py-4 rounded text-xs uppercase text-solstice-blue"
                        >
                            {{page * hitsPerPage + i + 1}}
                        </div>
                        <promoted-hit
                            class="w-240"
                            :hit="hit"
                            :image-size="indexImageSize"
                            :image-attribute="indexImageAttributeName"
                            :image-base-url="indexImageBaseUrl"
                            :image-suffix-url="indexImageSuffixUrl"
                            :title-attribute-name="indexTitleAttribute"
                            :auto-title-attribute-name="indexAutoTitleAttributeName"
                            @onUpdateAutoTitleAttributeName="indexAutoTitleAttributeName = $event"
                            v-bind="$props"
                        />
                        <div
                            v-if="searchResponse.queryID"
                            class="mr-12 cursor-pointer bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            @click="sendEvent(hit.objectID, page * hitsPerPage + i, 'click')"
                        >
                            Send Click Event
                        </div>
                        <div
                            v-if="searchResponse.queryID"
                            class="mr-12 cursor-pointer bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            @click="sendEvent(hit.objectID, page * hitsPerPage + i, 'conversion')"
                        >
                            Send Conversion Event
                        </div>
                    </div>
                    <div class="mt-16 mx-32 border-t border-proton-grey-opacity-40"></div>
                </div>
                <div class="flex justify-center">
                    <pagination
                        @onUpdatePage="page = $event"
                        :page="page"
                        :nb-pages="searchResponse.nbPages"
                    />
                </div>
            </div>
        </div>
        <div v-if="type === 'perso'" class="mt-24">
            <div>
                <div>
                    <label>
                        <input type="radio" v-model="event.eventType" value="click" /> Click
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" v-model="event.eventType" value="conversion" /> Conversion
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" v-model="event.eventType" value="view" /> View
                    </label>
                </div>
            </div>
            <div class="mt-8">
                <input
                    v-model="event.eventName"
                    placeholder="eventName"
                    class="mt-8 h-full px-16 py-8 bg-transparent text-telluric-blue leading-normal bg-white rounded border border-proton-grey-opacity-80"
                />
            </div>
            <div>
                <input
                    v-model="event.userToken"
                    placeholder="userToken"
                    class="mt-8 h-full px-16 py-8 bg-transparent text-telluric-blue leading-normal bg-white rounded border border-proton-grey-opacity-80"
                />
            </div>
            <div class="mt-8">
                <button
                    @click="sendEvent()"
                    class="mt-8 cursor-pointer bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                >
                    Send Event
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import Params from "common/components/params/Params";
    import PromotedHit from "common/components/explorer/synonyms-rules/PromotedHit";
    import Pagination from "common/components/explorer/results/Pagination";
    import SmallTabs from 'common/components/tabs/SmallTabs';
    import SearchIcon from 'common/icons/search.svg';
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import aa from 'search-insights';
    import titleAttribute from "common/mixins/titleAttribute";
    import PerformSearch from "common/components/explorer/results/PerformSearch";

    export default {
        name: 'Event',
        components: {SearchIcon, Params, PromotedHit, SmallTabs, Pagination, PerformSearch},
        props: ['appId', 'apiKey', 'indexName'],
        mixins: [indexInfoMixin, titleAttribute],
        data: function () {
            return {
                type: 'click',
                query: '',
                page: 0,
                hitsPerPage: 8,
                searchResponse: null,
                editableParams: {},
                algoliaParams: {},
                trackQueryInAnalytics: false,
                event: {
                    eventType: 'click', //
                    eventName: '', //
                    userToken: '', //
                    filters: [],
                }
            }
        },
        watch: {
            appId: function () { this.initialize(); },
            indexName: function () { this.initialize(); },
        },
        created: function () {
            this.initialize();
        },
        computed: {
            params: function () {
                return {
                    clickAnalytics: this.trackQueryInAnalytics,
                    hitsPerPage: this.hitsPerPage,
                    page: this.page,
                };
            },
        },
        methods: {
            initialize: function () {
                aa.init({
                    appId: this.appId,
                    apiKey: this.apiKey,
                });
            },
            onFetchHits: function (response) {
                this.searchResponse = response;
            },
            sendEvent: function (objectID, position, eventType) {
                if (this.type === 'click') {
                    aa.sendEvent(eventType, {
                        userToken: this.userToken || 'anonymous',
                        objectIDs: [objectID],
                        positions: [position],
                        timestamp: new Date().getTime(),
                        index: this.indexName,
                        eventName: this.event.eventName || 'clickAnalyticsResult',
                        queryID: this.searchResponse.queryID,
                    });
                } else if (this.type === 'perso') {
                    aa.sendEvent(this.eventType, {
                        userToken: this.userToken || 'anonymous',
                        objectIDs: [objectID],
                        timestamp: new Date().getTime(),
                        index: this.indexName,
                        eventName: this.event.eventName,
                        queryID: this.searchResponse.queryID,
                    });
                }
            },
            onMutate: function () {
                const params = {};
                Object.keys(this.editableParams).forEach((key) =>  {
                    params[key] = JSON.parse(JSON.stringify(this.editableParams[key].value));
                });
                this.algoliaParams = params;
            }
        }
    }
</script>
