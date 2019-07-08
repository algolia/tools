<template>
    <div class="w-full">
        <div class="flex text-telluric-blue text-sm">
            <div class="mr-48" v-if="Object.keys($store.state.apps).length > 0">
                <div class="mb-8">
                    <h4>Hits Display</h4>
                </div>
                <div class="flex h-48">
                    <div
                        class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                    >
                        <button
                            class="h-full py-8 px-16"
                            @click="showRankingInfo = !showRankingInfo"
                        >
                            <div>
                                <slider
                                    :class="[ showRankingInfo ? 'text-nebula-blue' : 'text-cosmos-black-opacity-60' ]"
                                    class="w-auto h-16 fill-current"
                                />
                            </div>
                            <div class="mt-4">
                                Ranking Info
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <div class="mr-48" v-if="Object.keys($store.state.apps).length > 0">
                <div class="mb-8">
                    <h4>Attributes Display</h4>
                </div>
                <div class="flex h-48">
                    <div class="w-148 h-full mr-16">
                        <button
                            @click="showSearchableAttributes = !showSearchableAttributes"
                            class="w-full h-full text-left py-4 px-8 block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                        >
                            <div class="flex items-center">
                                <div>
                                    <eye-icon v-if="showSearchableAttributes" class="text-nebula-blue w-auto h-12 stoke-current mr-8" />
                                    <eye-off-icon v-if="!showSearchableAttributes" class="w-auto h-12 stoke-current mr-8" />
                                </div>
                                <div>Searchable attributes</div>
                            </div>
                            <div v-if="showSearchableAttributes" class="ml-20 mt-4 text-xs">
                                Only matching <input type="checkbox" @click.stop v-model="showOnlyMatchingAttributes" />
                            </div>
                        </button>
                    </div>
                    <div class="w-172 flex flex-col justify-between h-full">
                        <button
                            @click="showCustomRanking = !showCustomRanking"
                            class="w-full flex py-4 px-8 items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                        >
                            <eye-icon v-if="showCustomRanking" class="text-nebula-blue w-auto h-12 stoke-current mr-8" />
                            <eye-off-icon v-if="!showCustomRanking" class="w-auto h-12 stoke-current mr-8" />
                            <div>Custom ranking attributes</div>
                        </button>
                        <button
                            @click="showAttributesForFaceting = !showAttributesForFaceting"
                            class="w-full flex py-4 px-8 items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                        >
                            <eye-icon v-if="showAttributesForFaceting" class="text-nebula-blue w-auto h-12 stoke-current mr-8" />
                            <eye-off-icon v-if="!showAttributesForFaceting" class="w-auto h-12 stoke-current mr-8" />
                            <div>Faceting attributes</div>
                        </button>
                    </div>
                </div>
            </div>
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
                                Manage Apps
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
    import Slider from "common/icons/sliders.svg";
    import CompareIcon from "common/icons/compare.svg";
    import EyeIcon from "common/icons/eye.svg";
    import EyeOffIcon from "common/icons/eye-off.svg";
    import BoxIcon from "common/icons/box.svg";
    import ShareIcon from "common/icons/share.svg";

    export default {
        name: 'DisplayConfig',
        components: {SplitIcon, Slider, CompareIcon, EyeIcon, EyeOffIcon, BoxIcon, ShareIcon},
        computed: {
            showSearchableAttributes: {
                get() {
                    return this.$store.state.panels.showSearchableAttributes;
                },
                set(value) {
                    this.$store.commit('panels/setShowSearchableAttributes', value);
                }
            },
            showCustomRanking: {
                get() {
                    return this.$store.state.panels.showCustomRanking;
                },
                set(value) {
                    this.$store.commit('panels/setShowCustomRanking', value);
                }
            },
            showAttributesForFaceting: {
                get() {
                    return this.$store.state.panels.showAttributesForFaceting;
                },
                set(value) {
                    this.$store.commit('panels/setShowAttributesForFaceting', value);
                }
            },
            showOnlyMatchingAttributes: {
                get() {
                    return this.$store.state.panels.showOnlyMatchingAttributes;
                },
                set(value) {
                    this.$store.commit('panels/setShowOnlyMatchingAttributes', value);
                }
            },
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
            showRankingInfo: {
                get () {
                    return this.$store.state.panels.displayRankingInfo;
                },
                set (value) {
                    this.$store.commit('panels/setDisplayRankingInfo', value);
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