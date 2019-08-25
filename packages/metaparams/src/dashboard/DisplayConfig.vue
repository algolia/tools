<template>
    <div class="w-full">
        <div class="flex text-telluric-blue text-sm">
            <hits-config />
            <div class="ml-auto" v-if="Object.keys($store.state.apps).length > 0">
                <div class="mb-8">
                    <h4>Panels</h4>
                </div>
                <div class="flex h-48">
                    <div
                        class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-16"
                    >
                        <button
                            class="h-full py-8 px-16"
                            @click="comparePanels = !comparePanels"
                        >
                            <div>
                                <compare-icon
                                    :class="[ comparePanels ? 'text-nebula-blue' : 'text-cosmos-black-opacity-60' ]"
                                    class="w-auto h-16 fill-current"
                                />
                            </div>
                            <div class="mt-4">
                                Compare Hits
                            </div>
                        </button>
                    </div>
                    <div
                        class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                    >
                        <button
                            class="h-full py-8 px-16"
                            @click="$store.commit('panels/setSplitMode', !$store.state.panels.splitMode)"
                        >
                            <div>
                                <split-icon
                                    :class="[ $store.state.panels.splitMode ? 'text-nebula-blue' : 'text-cosmos-black-opacity-60' ]"
                                    class="w-auto h-16 fill-current"
                                />
                            </div>
                            <div class="mt-4">
                                Split Mode
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <div :class="Object.keys($store.state.apps).length > 0 ? 'ml-48': 'ml-auto'">
                <div class="mb-8">
                    <h4>Management</h4>
                </div>
                <div class="flex h-48">
                    <div
                        v-if="Object.keys($store.state.apps).length > 0"
                        class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-16"
                    >
                        <button
                            class="h-full py-8 px-16"
                            @click="shareStatePanel = !shareStatePanel"
                        >
                            <div>
                                <share-icon
                                    :class="[ shareStatePanel ? 'text-nebula-blue' : 'text-cosmos-black-opacity-60' ]"
                                    class="w-auto h-16"
                                />
                            </div>
                            <div class="mt-4">
                                Share State
                            </div>
                        </button>
                    </div>
                    <div
                        class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-16"
                    >
                        <button
                            class="h-full py-8 px-16"
                            @click="manageAppsPanel = !manageAppsPanel"
                        >
                            <div>
                                <box-icon
                                    :class="[ manageAppsPanel ? 'text-nebula-blue' : 'text-cosmos-black-opacity-60' ]"
                                    class="w-auto h-16 fill-current"
                                />
                            </div>
                            <div class="mt-4">
                                Manage AppIDs
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import SplitIcon from "common/icons/split.svg";
    import CompareIcon from "common/icons/compare.svg";
    import BoxIcon from "common/icons/box.svg";
    import ShareIcon from "common/icons/share.svg";

    import HitsConfig from "common/components/configuration/HitsConfig";

    export default {
        name: 'DisplayConfig',
        components: {SplitIcon, CompareIcon, BoxIcon, ShareIcon, HitsConfig},
        computed: {
            comparePanels: {
                get() {
                    return this.$store.state.panels.comparePanels;
                },
                set(value) {
                    this.$store.commit("panels/setComparePanels", value);
                }
            },
            manageAppsPanel: {
                get() {
                    return this.$store.state.panels.manageAppsPanel;
                },
                set(value) {
                    this.$store.commit("panels/setManageAppsPanel", value);
                }
            },
            shareStatePanel: {
                get () {
                    return this.$store.state.panels.shareStatePanel || false;
                },
                set (value) {
                    this.$store.commit('panels/setShareStatePanel', value);
                }
            },
        }
    }
</script>