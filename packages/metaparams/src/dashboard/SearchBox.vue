<template>
    <div class="flex items-center px-16 bg-white rounded border border-proton-grey-opacity-80">
        <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
        <input
            class="flex-1 block h-full py-8 bg-transparent text-telluric-blue leading-normal"
            placeholder="Search for anything"
            v-model="query"
        >
        <div class="text-telluric-blue-opacity-40" v-if="$store.state.panels.splitMode && (!panelKey || panelKey === 'leftPanel')">
            ≠ queries <input type="checkbox" v-model="twoInputs" />
        </div>
    </div>
</template>

<script>
    import SearchIcon from "common/icons/search.svg";
    import indexInfoMixin from "common/mixins/indexInfoMixin";

    export default {
        name: 'SearchBox',
        props: ['panelKey'],
        mixins: [indexInfoMixin],
        components: {SearchIcon},
        computed: {
            twoInputs: {
                get () {
                    return this.$store.state.panels.twoInputs || false;
                },
                set (value) {
                    if (this.$store.state.panels.splitMode) {
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

                    this.$store.commit('panels/setTwoInputs', value);
                }
            },
            query: {
                get() {
                    if (this.panelKey === 'rightPanel' && this.panelIndexData) {
                        return this.searchParams.query || '';
                    }
                    return this.$store.state.panels.query;
                },
                set(value) {
                    if (this.panelKey === 'rightPanel') {
                        return this.$store.commit(`apps/${this.panelAppId}/${this.panelIndexName}/setParamValue`, {
                            configKey: this.searchConfigKey,
                            key: 'query', value: value,
                        });
                    }
                    return this.$store.commit("panels/setQuery", value);
                }
            },
        },
    }
</script>