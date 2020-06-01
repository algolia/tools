<template>
    <internal-app>
        <div class="min-h-screen pb-48">
            <app-header app-name="Index Analyzer">
                <display-config class="mx-16 mt-0 ml-auto" />
            </app-header>
            <div class="px-48 mt-24">
                <app-management @onAddedAppId="appId = $event" />
                <div class="max-w-960 mx-auto mt-24">
                    <div class="rounded border border-proton-grey-opacity-60 mt-24">
                        <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                            <app-selector v-model="appId" />
                            <index-selector
                                v-model="indexName"
                                :app-id="appId"
                                class="ml-24"
                            />
                            <div class="flex flex-grow">
                                <input placeholder="attributeName" class="rounded ml-24 px-8 max-w-third flex-grow" v-model="attributeName" />
                                <input v-if="attributeName.length > 0" placeholder="type" class="rounded ml-24 px-8 max-w-third flex-grow" v-model="typeFilter" />
                                <input v-if="attributeName.length > 0" placeholder="value" class="rounded ml-24 px-8 max-w-third flex-grow" v-model="valueFilter" />
                            </div>
                        </div>
                        <div class="bg-white text-nova-grey">
                            <metrics
                                :app-id="appId"
                                :index-name="indexName"
                                :attribute-name="attributeName"
                                :attributes="attributes"
                                :typeFilter="typeFilter"
                                :valueFilter="valueFilter"
                                @onUpdateAttributeName="attributeName = $event"
                                @onUpdateValueFilter="valueFilter = $event"
                                @onUpdateTypeFilter="typeFilter = $event"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "./DisplayConfig";
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';
    import Metrics from "./Metrics";
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import paramsSpecs from 'common/params-specs';
    import {cleanAttributeName} from "common/utils/formatters";

    export default {
        name: 'App',
        components: {Metrics, InternalApp, AppHeader, AppManagement, DisplayConfig, AppSelector, IndexSelector},
        data: function () {
            return {
                attributes: {},
                timeout: null,
                attributeName: '',
                typeFilter: '',
                valueFilter: '',
            }
        },
        created: function () {
            this.loadUrl();
            this.getAttributesInSettings();

            window.onpopstate = () => {
                this.loadUrl();
            };
            this.updateUrl(true);
        },
        watch: {
            attributeName: function () { this.typeFilter = ''; this.valueFilter = '' },
            uniquekey: function (o, n) {
                if (o !== n) {
                    this.getAttributesInSettings();
                    this.updateUrl();
                }
            }
        },
        computed: {
            uniquekey: function () {
                return `${this.appId}-${this.indexName}-${this.attributeName}-${this.typeFilter}-${this.valueFilter}`;
            },
            appId: {
                get () {
                    return this.$store.state.indexanalyzer.appId || null;
                },
                set (appId) {
                    this.attributeName = '';
                    this.$store.commit(`indexanalyzer/setAppId`, appId);
                }
            },
            indexName: {
                get () {
                    return this.$store.state.indexanalyzer.indexName || null;
                },
                set (indexName) {
                    this.attributeName = '';
                    this.$store.commit(`indexanalyzer/setIndexName`, indexName);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId] ? this.$store.state.apps[this.appId].key : '';
            },
        },
        methods: {
            loadUrl: function () {
                const url = new URL(window.location.href);
                const appId = url.searchParams.get("app-id");
                const indexName = url.searchParams.get("index-name");
                const attribute = url.searchParams.get("attribute");
                const type = url.searchParams.get("type");
                const value = url.searchParams.get("value");

                if (appId !== null && indexName !== null) {
                    this.appId = appId;
                    this.indexName = indexName;
                    if (attribute !== null && type !== null && value !== null) {
                        this.attributeName = attribute;
                        this.typeFilter = type;
                        this.valueFilter = value;
                    }
                }
            },
            updateUrl: function (replaceState) {
                const url = `${window.location.origin}${window.location.pathname}?app-id=${this.appId}&index-name=${this.indexName}&attribute=${this.attributeName}&type=${this.typeFilter}&value=${this.valueFilter}`;

                if (replaceState) {
                    window.history.replaceState(null, null, url);
                } else {
                    window.history.pushState(null, null, url);
                }
            },
            addAttribute: function (key, attr, i) {
                const attributes = attr.split(',').map((a) => cleanAttributeName(a));
                attributes.forEach((a) => {
                    if (!this.attributes[a]) {
                        this.$set(this.attributes, a, []);
                    }

                    this.attributes[a].push({
                        'settings': key,
                        'position': i,
                        'nested': false,
                    });

                    const parentAttributes = a.split('.');
                    if (parentAttributes.length > 1) {
                        parentAttributes.slice(0, parentAttributes.length - 1).forEach((pa, j) => {
                            const a2 = parentAttributes.slice(0, j + 1).join('.');

                            if (!this.attributes[a2]) {
                                this.$set(this.attributes, a2, []);
                            }

                            if (this.attributes[a2].findIndex((a) => a.settings === key && a.nested === true) !== -1) return;

                            this.attributes[a2].push({
                                'settings': key,
                                'position': i,
                                'nested': true,
                            });
                        });
                    }
                });
            },
            getAttributesInSettings: async function () {
                if (!this.appId || !this.apiKey || !this.indexName) return;

                this.attributes = {};
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName);
                const settings = await index.getSettings();

                for (let key in settings) {
                    if (!paramsSpecs[key] || !settings[key]) continue;
                    if (paramsSpecs[key].value_type === 'attribute') {
                        this.addAttribute(key, settings[key]);
                    }
                    if (paramsSpecs[key].value_type === 'attributes_list') {
                        settings[key].forEach((attr, i) => this.addAttribute(key, attr, i));
                    }

                    if (paramsSpecs[key].object_type === 'decompounded_attributes') {
                        for (let lang in settings[key]) {
                            settings[key][lang].forEach((attr, i) => this.addAttribute(key, attr, i));
                        }
                    }
                }
            }
        }
    }
</script>
