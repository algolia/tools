<template>
    <div>
        <results-info :panel-key="panelKey" :algolia-response="algoliaResponse" />
        <div class="w-full" v-if="displayMode === 'list'">
            <applied-alternatives :algolia-response="algoliaResponse" />
            <applied-rules :panel-key="panelKey" :algolia-response="algoliaResponse" />
        </div>
        <div v-if="algoliaResponse.hits.length > 0">
            <div v-if="(displayMode === 'list' && needTitleAttribute) || displayMode === 'images'" class="mt-24 text-solstice-blue-opacity-70">
                <div>
                    Extra attribute to display:
                    <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4" v-model="panelTitleAttribute" placeholder="attribute_name"/>
                </div>
                <div>(default to first string attribute in searchableAttribute)</div>
            </div>
            <div class="w-full" :class="displayMode === 'list' ? '' : 'flex flex-wrap'">
                <hit v-for="(hit, i) in algoliaResponse.hits"
                     :hit="hit"
                     :hit-position="i"
                     :previous-hit="i > 0 ? algoliaResponse.hits[i - 1] : hit"
                     :key="hit.objectID"
                     :algolia-response="algoliaResponse"
                     :panel-key="panelKey"
                     :top-attributes="topAttributes"
                     :searchable-attributes="searchableAttributes"
                     :display-mode="displayMode"
                     :record-can-jump="recordCanJump"
                     :title-attribute="titleAttribute"
                />
                <!--<facets :attributes-for-faceting="attributesForFaceting" :panel-key="panelKey" class="blo" />-->
            </div>
            <div class="flex justify-center">
                <pagination
                    v-model="page"
                    :page="page"
                    :nb-pages="algoliaResponse.nbPages"
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
    import indexInfoMixin from "../../../mixins/indexInfoMixin";
    import Hit from "../hits/Hit";
    import {cleanAttributeName, cleanDeepAttributeName} from '../../../utils/formatters'
    import AppliedAlternatives from "./AppliedAlternatives";

    const isString = function (s) {
        return typeof s === 'string' || s instanceof String;
    };

    export default {
        name: 'ResultsList',
        props: ['panelKey', 'algoliaResponse', 'displayMode'],
        mixins: [indexInfoMixin],
        components: {AppliedAlternatives, Hit, ResultsInfo, Pagination, AppliedRules},
        watch: {
            titleAttribute: {
                immediate: true,
                handler: function () {
                    this.panelAutoTitleAttributeName = this.titleAttribute;
                }
            }
        },
        computed: {
            page: {
                get () {
                    return this.searchParams.page || 0;
                },
                set(value) {
                    this.$store.commit(`${this.panelIndexCommitPrefix}/setParamValue`, {
                        configKey: this.searchConfigKey,
                        key: 'page',
                        value: value
                    });
                }
            },
            attributesForFaceting: function () {
                return this.refIndexSettings.attributesForFaceting || [];
            },
            recordCanJump: function () {
                if (!this.$store.state.panels.splitMode) return false;
                if (this.sameIndexOnEachPanel) return false;

                const otherPanelKey = this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
                const otherPanelCurrentTabIsHits = this.$store.state.panels[otherPanelKey].currentTab === 'hits';
                const otherPanelInListMode = this.$store.state.panels[otherPanelKey].displayMode === 'list';

                if (!otherPanelCurrentTabIsHits || !otherPanelInListMode) return false;

                const appId = this.$store.state.panels[otherPanelKey].appId;
                const indexName = this.$store.state.panels[otherPanelKey].indexName;
                const panelIndexData = this.$store.state.apps[appId][indexName];

                if (!panelIndexData || !panelIndexData.refIndexSettings) return false;

                return !panelIndexData.refIndexSettings.primary;
            },
            searchableAttributes: function () {
                const searchableAttributes = this.refIndexSettings.searchableAttributes || this.refIndexSettings.attributesToIndex || [];

                if (searchableAttributes.length === 0) return [];

                return this.getAllSearchableAttributes(searchableAttributes).map(cleanAttributeName).map(cleanDeepAttributeName);
            },
            topAttributes: function () {
                const topAttributes = ['objectID', this.titleAttribute];


                if (this.$store.state.panels.showSearchableAttributes) topAttributes.push(...this.searchableAttributes);
                if (this.$store.state.panels.showCustomRanking) topAttributes.push(...(this.refIndexSettings.customRanking || []))
                if (this.$store.state.panels.showAttributesForFaceting) topAttributes.push(...this.attributesForFaceting);

                return [...new Set(topAttributes)].map(cleanAttributeName).map(cleanDeepAttributeName);
            },
            titleAttribute: function () {
                let titleAttribute = this.panelTitleAttribute;
                const searchableAttributes = this.refIndexSettings.searchableAttributes || this.refIndexSettings.attributesToIndex || [];
                const hit = this.algoliaResponse.hits.length > 0 ? this.algoliaResponse.hits[0] : {};

                if (titleAttribute.length <= 0) {
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
                return !this.$store.state.panels.showSearchableAttributes
                    && !this.$store.state.panels.showCustomRanking
                    && !this.$store.state.panels.showAttributesForFaceting;
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