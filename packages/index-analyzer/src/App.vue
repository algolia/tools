<template>
    <internal-app>
        <div class="min-h-screen pb-48">
            <app-header app-name="Index Analyzer">
                <display-config class="mx-16 mt-0 ml-auto" />
            </app-header>
            <div class="px-48 mt-24">
                <app-management />
                <div class="max-w-960 mx-auto mt-24">
                    <div class="rounded border border-proton-grey-opacity-60 mt-24">
                        <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                            <app-selector v-model="appId" />
                            <index-selector
                                v-model="indexName"
                                :app-id="appId"
                                class="ml-24"
                            />
                            <input placeholder="attributeName" class="rounded ml-24 px-8 flex-grow" v-model="attributeName" />
                        </div>
                        <div class="bg-white text-nova-grey">
                            <metrics
                                :app-id="appId"
                                :index-name="indexName"
                                :attribute-name="attributeName"
                                :attributes="attributes"
                                @onUpdateAttributeName="attributeName = $event"
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
            }
        },
        created: function () {
          this.getAttributesInSettings();
        },
        computed: {
            appId: {
                get () {
                    return this.$store.state.indexanalyzer.appId || null;
                },
                set (appId) {
                    this.attributeName = '';
                    this.$store.commit(`indexanalyzer/setAppId`, appId);
                    this.getAttributesInSettings();
                }
            },
            indexName: {
                get () {
                    return this.$store.state.indexanalyzer.indexName || null;
                },
                set (indexName) {
                    this.attributeName = '';
                    this.$store.commit(`indexanalyzer/setIndexName`, indexName);
                    this.getAttributesInSettings();
                }
            },
            attributeName: {
                get () {
                    return this.$store.state.indexanalyzer.attributeName || '';
                },
                set (attributeName) {
                    this.$store.commit(`indexanalyzer/setAttributeName`, attributeName);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId] ? this.$store.state.apps[this.appId].key : '';
            },
        },
        methods: {
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
