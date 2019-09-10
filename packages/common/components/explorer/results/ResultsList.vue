<template>
    <div>
        <div class="w-full" v-if="displayMode === 'list'">
            <applied-params :algolia-response="searchResponse" :search-params="searchParams" />
            <applied-alternatives :algolia-response="searchResponse" />
            <applied-rules v-bind="$props" v-on="$listeners" />
        </div>
        <div v-if="searchResponse.hits.length > 0">
            <div v-if="(displayMode === 'list' && needTitleAttribute) || displayMode === 'images'" class="mt-24 text-solstice-blue-opacity-70">
                <div>
                    Extra attribute to display:
                    <input
                        class="w-128 bg-oton-grey-opacity-20 text-xs p-4"
                        :value="titleAttributeName"
                        @input="$emit('onUpdateTitleAttributeName', $event.target.value)"
                        placeholder="attribute_name"/>
                </div>
                <div>(default to first string attribute in searchableAttribute)</div>
            </div>
            <div class="w-full" :class="displayMode === 'list' ? '' : 'flex flex-wrap'">
                <hit v-for="(hit, i) in searchResponse.hits"
                     :key="hit.objectID"
                     :hit="hit"
                     :hit-position="i"
                     :previous-hit="i > 0 ? searchResponse.hits[i - 1] : hit"
                     :top-attributes="topAttributes"
                     :searchable-attributes="searchableAttributes"
                     :title-attribute="titleAttribute"
                     v-bind="$props"
                     v-on="$listeners"
                />
            </div>
            <div class="flex justify-center" v-if="!disablePagination">
                <pagination
                    v-on="$listeners"
                    @onUpdatePage="page = $event"
                    :page="page"
                    :cursor="searchResponse.cursor"
                    :nb-pages="searchResponse.nbPages"
                />
            </div>
        </div>
        <div
            v-else
            class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8"
        >
            No results
        </div>
    </div>
</template>

<script>

    import AppliedRules from "./AppliedRules";
    import Pagination from "./Pagination";
    import ResultsInfo from "./ResultsInfo";
    import Hit from "../hits/Hit";
    import {cleanAttributeName, cleanDeepAttributeName} from '../../../utils/formatters'
    import AppliedAlternatives from "./AppliedAlternatives";
    import props from "../props";
    import AppliedParams from "./AppliedParams";

    const isString = function (s) {
        return typeof s === 'string' || s instanceof String;
    };

    export default {
        name: 'ResultsList',
        props: [
            'panelKey',
            'disablePagination',
            ...props.credentials,
            ...props.images,
            ...props.attributes,
            ...props.paramsAndSettings,
            ...props.response,
            ...props.display,
            ...props.actions,
        ],
        components: {AppliedParams, AppliedAlternatives, Hit, ResultsInfo, Pagination, AppliedRules},
        watch: {
            titleAttribute: {
                immediate: true,
                handler: function () {
                    this.$emit('onUpdateAutoTitleAttributeName', this.titleAttribute);
                }
            }
        },
        computed: {
            page: {
                get () {
                    return this.searchParams.page || 0;
                },
                set(value) {
                    this.$emit('onUpdatePage', value);
                }
            },
            attributesForFaceting: function () {
                return this.indexSettings.attributesForFaceting || [];
            },
            searchableAttributes: function () {
                const searchableAttributes = this.indexSettings.searchableAttributes || this.indexSettings.attributesToIndex || [];
                return this.getAllSearchableAttributes(searchableAttributes).map(cleanAttributeName).map(cleanDeepAttributeName);
            },
            topAttributes: function () {
                const topAttributes = ['objectID', this.titleAttribute];

                if (this.showSearchableAttributes) topAttributes.push(...this.searchableAttributes);
                if (this.showCustomRanking) topAttributes.push(...(this.indexSettings.customRanking || []));
                if (this.showAttributesForFaceting) topAttributes.push(...this.attributesForFaceting);
                if (this.searchParams.attributesToRetrieve) {
                    if (this.searchParams.attributesToRetrieve.indexOf('*') !== -1) return [];
                    topAttributes.push(...this.searchParams.attributesToRetrieve);
                }

                return [...new Set(topAttributes)].map(cleanAttributeName).map(cleanDeepAttributeName);
            },
            titleAttribute: function () {
                let titleAttribute = this.titleAttributeName;

                if (!titleAttribute) {
                    const searchableAttributes = this.indexSettings.searchableAttributes || this.indexSettings.attributesToIndex || [];
                    const hit = this.searchResponse.hits.length > 0 ? this.searchResponse.hits[0] : {};

                    for (let i in searchableAttributes) {
                        const newTitleAttribute = cleanAttributeName(cleanDeepAttributeName(
                            searchableAttributes[i].split(',')[0]
                        ));
                        if (isString(hit[newTitleAttribute])) {
                            titleAttribute = newTitleAttribute;
                            break;
                        }
                    }
                }

                return titleAttribute || 'objectID';
            },
            needTitleAttribute: function () {
                return !this.showSearchableAttributes
                    && !this.showCustomRanking
                    && !this.showAttributesForFaceting;
            },
        },
        methods: {
            getAllSearchableAttributes: function (attributes) {
                const allAttributes = [];

                attributes.forEach((attribute) => {
                    attribute.split(',').forEach((attr) => {
                        allAttributes.push(attr);
                    });
                });

                return allAttributes;
            },
        },
    }
</script>