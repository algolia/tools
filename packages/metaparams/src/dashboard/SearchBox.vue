<template>
    <div class="flex items-center pl-16 bg-white rounded border border-proton-grey-opacity-80 h-40">
        <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
        <input
            class="flex-1 block h-full bg-transparent text-telluric-blue leading-normal"
            placeholder="Enter query, searchParams, curl command, ..."
            ref="search"
            v-model="query"
        >
        <div class="text-telluric-blue-opacity-40" v-if="$store.state.panels.splitMode && (!panelKey || panelKey === 'leftPanel')">
            ≠ queries <input type="checkbox" v-model="twoInputs" />
        </div>
        <custom-select
            v-model="panelMethod"
            :options="Object.keys(methodOptions)"
            class="ml-16 bg-moon-grey h-full pl-16 px-8 flex items-center text-telluric-blue rounded-r"
        >
            <template v-slot:default="{option}">{{methodOptions[option]}}</template>
        </custom-select>
    </div>
</template>

<script>
    import SearchIcon from "common/icons/search.svg";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import panelsMixin from "common/mixins/panelsMixin";
    import {parseCurlCommand} from "common/utils/curlCommandExtractor";
    import indexInfoMixin from "common/mixins/indexInfoMixin";

    export default {
        name: 'SearchBox',
        props: ['panelKey'],
        mixins: [panelsMixin, indexInfoMixin],
        components: {SearchIcon, CustomSelect},
        data: function () {
            return {
                methodOptions: {'search': 'Search', 'browse': 'Browse'},
            }
        },
        computed: {
            appId: function () { // Necessary to fetch searchParams
                return this.panelAppId;
            },
            indexName: function () { // Necessary to fetch searchParams
                return this.panelIndexName;
            },
            twoInputs: {
                get () {
                    return this.$store.state.panels.twoInputs || false;
                },
                set (value) {
                    if (this.$store.state.panels.splitMode) {
                        try {
                            const params = JSON.parse(selected);
                            Object.keys(params).map((key) => {
                                this.setParamValue(key, params[key]);
                            });
                            return this.inputState.setInput('none');
                        } catch (e) {}

                        if (!value) {
                            this.$store.commit(`apps/${this.$store.state.panels.rightPanel.appId}/${this.$store.state.panels.rightPanel.indexName}/deleteParam`, {
                                configKey: this.sameIndexOnEachPanel ? 'searchParams2' : 'searchParams',
                                inputKey: 'query',
                            });
                        } else {
                            this.$store.commit(`apps/${this.$store.state.panels.rightPanel.appId}/${this.$store.state.panels.rightPanel.indexName}/setParamValue`, {
                                configKey: this.sameIndexOnEachPanel ? 'searchParams2' : 'searchParams',
                                key: 'query',
                                value: this.query,
                            });
                        }
                    }

                    this.panelMethod = this.panelMethod; // Expected, we need to override rightPanel in case we go back to one input;
                    this.$store.commit('panels/setTwoInputs', value);
                }
            },
            query: {
                get() {
                    if (this.panelKey === 'rightPanel' && this.indexData) {
                        return this.searchParams.query || '';
                    }
                    return this.$store.state.panels.query;
                },
                set(value) {
                    let query = value;
                    let appId = this.panelAppId;
                    let indexName = this.panelIndexName;

                    if (query.trim().startsWith('{')) {
                        try {
                            const params = JSON.parse(query);
                            Object.keys(params).forEach((key) => {
                                if (key === 'query') {
                                    query = params.query;
                                    this.$refs.search.value = query;
                                }
                                else {
                                    this.$store.commit(`apps/${appId}/${indexName}/setParamValue`, {
                                        configKey: this.searchConfigKey, key: key, value: params[key],
                                    });
                                }
                            });
                        } catch (e) {}
                    }

                    if (value.startsWith('curl ')) {
                        const res = parseCurlCommand(value);

                        if (res) {
                            query = res.query;
                            appId = res.appId;
                            indexName = res.indexName;
                            this.$store.commit("apps/addAppId", {appId: appId});
                            this.$store.commit(`apps/${appId}/addIndex`, indexName);
                            this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {appId: appId, indexName: indexName});
                            this.$nextTick(() => {
                                this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {appId: appId, indexName: indexName});
                            }, 1); // We need to redo it again on next tick because the indexName will be set to null by the IndexSelector
                            this.$store.commit(`panels/${this.panelKey}/setServer`, res.machine);

                            this.$store.commit('panels/clearParams', {panelKey: this.panelKey, configKey: this.searchConfigKey});
                            Object.keys(res.params).forEach((key) => {
                                this.$store.commit(`apps/${res.appId}/${res.indexName}/setParamValue`, {
                                    configKey: this.searchConfigKey, key: key, value: res.params[key],
                                });
                            });
                        }
                        this.$refs.search.value = query;
                    }

                    if (this.panelKey === 'rightPanel') {
                        return this.$store.commit(`apps/${appId}/${indexName}/setParamValue`, {
                            configKey: this.searchConfigKey,
                            key: 'query', value: query,
                        });
                    }
                    return this.$store.commit("panels/setQuery", query);
                }
            },
        },
    }
</script>
