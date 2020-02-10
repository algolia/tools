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
                    <input v-model="trackQueryInAnalytics" type="checkbox"> Track queries in Analytics (needed to send click/conversion events)
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
            <div class="mt-40">
                <div v-for="(hit, i) in hits" class="my-16 relative">
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
                            v-bind="$props"
                        />
                        <div
                            v-if="event.queryID"
                            class="mr-12 cursor-pointer bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            @click="sendEvent(hit.objectID, page * hitsPerPage + i, 'click')"
                        >
                            Send Click Event
                        </div>
                        <div
                            v-if="event.queryID"
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
                        :nb-pages="nbPages"
                    />
                </div>
            </div>
        </div>
        <div v-if="type === 'perso'" class="mt-24">
            <div>
                Click <input type="radio" v-model="event.eventType" value="click" />
                Conversion <input type="radio" v-model="event.eventType" value="conversion" />
                <template v-if="type === 'perso'">
                    View <input type="radio" v-model="event.eventType" value="view" />
                </template>
            </div>
            <div>
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
            <div>
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
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import aa from 'search-insights';

    export default {
        name: 'Event',
        components: {SearchIcon, Params, PromotedHit, SmallTabs, Pagination},
        props: ['appId', 'apiKey', 'indexName'],
        mixins: [indexInfoMixin],
        data: function () {
            return {
                type: 'click',
                query: '',
                page: 0,
                nbPages: 1,
                hitsPerPage: 8,
                hits: [],
                editableParams: {},
                algoliaParams: {},
                trackQueryInAnalytics: false,
                event: {
                    eventType: 'click', //
                    eventName: '', //
                    userToken: '', //
                    timestamp: 0, //
                    queryID: '', //
                    filters: [],
                }
            }
        },
        watch: {
            appId: function () { this.initialize(); },
            indexName: function () { this.initialize(); },
            query: function () { this.performSearch(); },
            page: function () { this.performSearch(); },
            trackQueryInAnalytics: function () { this.performSearch() },
        },
        created: function () {
            this.initialize();
        },
        methods: {
            initialize: function () {
                this.event.queryID = null;
                aa.init({
                    appId: this.appId,
                    apiKey: this.apiKey,
                });
                this.performSearch();
            },
            performSearch: async function () {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName);
                const res = await index.search(this.query, {
                    clickAnalytics: this.trackQueryInAnalytics,
                    hitsPerPage: this.hitsPerPage,
                    page: this.page,
                });
                this.event.queryID = res.queryID;
                this.nbPages = res.nbPages;
                this.hits = Object.freeze(res.hits);
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
                        queryID: this.event.queryID,
                    });
                } else if (this.type === 'perso') {
                    aa.sendEvent(this.eventType, {
                        userToken: this.userToken || 'anonymous',
                        objectIDs: [objectID],
                        timestamp: new Date().getTime(),
                        index: this.indexName,
                        eventName: this.event.eventName,
                        queryID: this.event.queryID,
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
