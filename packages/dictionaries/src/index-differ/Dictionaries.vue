<template>
    <div class="pb-24 text-lg">
        <app-header app-name="Dictionaries Search" />
        <ais-instant-search :search-client="searchClient" index-name="prod_dictionaries">
            <ais-configure
                highlightPreTag="<em>"
                highlightPostTag="</em>"
            />
            <div class="flex">
                <div class="left m-24 mr-0 min-w-280">
                    <ais-panel class="bg-white border border-proton-grey-opacity-40 rounded p-12">
                        <div>
                            <div class="text-sm uppercase text-telluric-blue tracking-wide border-b border-proton-grey-opacity-40 pb-8 mb-12">
                                Dictionary
                            </div>
                            <ais-refinement-list
                                attribute="type"
                                operator="or"
                                :limit="10"
                                :sort-by="['name:asc']"
                                :class-names="{
                                    'ais-RefinementList-item': 'py-2',
                                    'ais-RefinementList-label': 'flex items-center',
                                    'ais-RefinementList-labelText': 'ml-8 mr-auto',
                                    'ais-RefinementList-showMore': 'mt-8 bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm',
                                    'ais-RefinementList-count': 'text-sm bg-proton-grey-opacity-40 p-4 px-8 rounded-full text-cosmos-black-opacity-80',
                                    'ais-RefinementList-searchBox': 'py-4 px-8 border border-proton-grey-opacity-40 rounded mb-12',
                                    'ais-RefinementList-checkbox': 'm-2',
                                    'ais-SearchBox-submit': 'hidden',
                                    'ais-SearchBox-reset': 'hidden',
                                }"
                            />
                        </div>
                    </ais-panel>
                    <ais-panel class="mt-24 bg-white border border-proton-grey-opacity-40 rounded p-12">
                        <div>
                            <div class="text-sm uppercase text-telluric-blue tracking-wide border-b border-proton-grey-opacity-40 pb-8 mb-12">
                                Language
                            </div>
                            <ais-refinement-list
                                attribute="lang"
                                operator="or"
                                :limit="20"
                                :show-more="true"
                                :show-more-limit="100"
                                :searchable="true"
                                :sort-by="['name:asc']"
                                :class-names="{
                                    'ais-RefinementList-item': 'py-2',
                                    'ais-RefinementList-label': 'flex items-center',
                                    'ais-RefinementList-labelText': 'ml-8 mr-auto',
                                    'ais-RefinementList-showMore': 'mt-8 bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm',
                                    'ais-RefinementList-count': 'text-sm bg-proton-grey-opacity-40 p-4 px-8 rounded-full text-cosmos-black-opacity-80',
                                    'ais-RefinementList-searchBox': 'py-4 px-8 border border-proton-grey-opacity-40 rounded mb-12',
                                    'ais-RefinementList-checkbox': 'm-2',
                                    'ais-SearchBox-submit': 'hidden',
                                    'ais-SearchBox-reset': 'hidden',
                                }"
                            />
                        </div>
                    </ais-panel>
                </div>

                <div class="flex-grow m-24">
                    <ais-search-box
                        placeholder="search words"
                    >
                        <div
                            slot-scope="{ currentRefinement, isSearchStalled, refine }"
                            class="flex items-center pl-16 bg-white rounded border border-proton-grey-opacity-40 h-40"
                        >
                            <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
                            <input
                                class="flex-1 block h-full bg-transparent text-telluric-blue leading-normal"
                                placeholder="Search words"
                                v-model="currentRefinement"
                                @input="refine($event.currentTarget.value)"
                            >
                        </div>
                    </ais-search-box>

                    <div class="bg-white border border-proton-grey-opacity-40 rounded mt-24 p-12 pt-0 rounded">
                        <ais-state-results>
                            <template slot-scope="{ hits }">
                                <ais-hits
                                    v-if="hits.length > 0"
                                    :escapeHTML="false"
                                    class="pb-20"
                                >
                                    <div class="mt-0" slot-scope="{ items }">
                                        <div class="border-b border-nova-grey-opacity-20 py-12" v-for="item in items" :key="item.objectID">
                                            <div class="hit">
                                                <div class="text-telluric-blue mb-8">{{item.type}} – <span v-html="item._highlightResult.lang.value"></span></div>
                                                <template v-for="word in item._highlightResult.words">
                                                    <span class="words" v-html="word.value"></span>&nbsp;
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </ais-hits>
                                <div v-else class="py-12">
                                    No results
                                </div>
                            </template>
                        </ais-state-results>

                        <ais-state-results class="flex justify-center">
                            <ais-pagination slot-scope="{ _rawResults }">
                                <pagination
                                    slot-scope="{refine}"
                                    :page="_rawResults[0].page"
                                    :nb-pages="_rawResults[0].nbPages"
                                    @onSetParamValue="(_, page) => refine(page)"
                                />
                            </ais-pagination>
                        </ais-state-results>
                    </div>
                </div>
            </div>
        </ais-instant-search>
    </div>
</template>

<script>
    import AppHeader from "common/components/header/AppHeader";
    import Pagination from "common/components/explorer/results/Pagination";
    import algoliasearch from "algoliasearch";
    import { AisInstantSearch, AisSearchBox, AisPagination, AisHits, AisRefinementList, AisPanel, AisStateResults, AisConfigure } from 'vue-instantsearch';
    import SearchIcon from "common/icons/search.svg";

    export default {
        name: 'Dictionaries',
        components: {AppHeader, AisInstantSearch, AisSearchBox, AisPagination, AisHits, AisRefinementList, AisPanel, Pagination, AisStateResults, AisConfigure, SearchIcon},
        data: function () {
            return {
                searchClient: algoliasearch('RSBCBF0EG8', 'c56fcd479e08dadd2a943872a41d3f92'),
            };
        },
    }
</script>