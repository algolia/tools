<template>
    <div class="flex text-telluric-blue text-sm">
        <div class="ml-48 mr-48" v-if="Object.keys($store.state.apps).length > 0">
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
                            <slider-icon
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
                        <div v-if="showSearchableAttributes" class="ml-20 mt-4 text-xs flex">
                            <div>Only matching</div><input class="ml-4 -mt-2" type="checkbox" @click.stop v-model="showOnlyMatchingAttributes" />
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
        <div class="mr-48" v-if="Object.keys($store.state.apps).length > 0">
            <div class="mb-8">
                <h4>Distraction Free</h4>
            </div>
            <div class="flex h-48">
                <div class="w-172 flex flex-col justify-between h-full mr-16">
                    <button
                        @click="showParamsAndSettings = !showParamsAndSettings"
                        class="w-full flex py-4 px-8 items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                    >
                        <eye-icon v-if="showParamsAndSettings" class="text-nebula-blue w-auto h-12 stoke-current mr-8" />
                        <eye-off-icon v-if="!showParamsAndSettings" class="w-auto h-12 stoke-current mr-8" />
                        <div>Params & Settings</div>
                    </button>
                    <button
                        @click="showIndexSelector = !showIndexSelector"
                        class="w-full flex py-4 px-8 items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                    >
                        <eye-icon v-if="showIndexSelector" class="text-nebula-blue w-auto h-12 stoke-current mr-8" />
                        <eye-off-icon v-if="!showIndexSelector" class="w-auto h-12 stoke-current mr-8" />
                        <div>Index Selector</div>
                    </button>
                </div>
                <div class="w-172 flex flex-col justify-between h-full">
                    <button
                        @click="showResultTabs = !showResultTabs"
                        class="w-full flex py-4 px-8 items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                    >
                        <eye-icon v-if="showResultTabs" class="text-nebula-blue w-auto h-12 stoke-current mr-8" />
                        <eye-off-icon v-if="!showResultTabs" class="w-auto h-12 stoke-current mr-8" />
                        <div>Result Tabs</div>
                    </button>
                    <button
                        @click="showQueryInfo = !showQueryInfo"
                        class="w-full flex py-4 px-8 items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                    >
                        <eye-icon v-if="showQueryInfo" class="text-nebula-blue w-auto h-12 stoke-current mr-8" />
                        <eye-off-icon v-if="!showQueryInfo" class="w-auto h-12 stoke-current mr-8" />
                        <div>Query Info</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import SliderIcon from "common/icons/sliders.svg";
    import EyeIcon from "common/icons/eye.svg";
    import EyeOffIcon from "common/icons/eye-off.svg";

    export default {
        name: 'HitsConfig',
        components: {SliderIcon, EyeIcon, EyeOffIcon},
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
            showRankingInfo: {
                get () {
                    return this.$store.state.panels.displayRankingInfo;
                },
                set (value) {
                    this.$store.commit('panels/setDisplayRankingInfo', value);
                }
            },
            showParamsAndSettings: {
                get() {
                    if (this.$store.state.panels.showParamsAndSettings === undefined) return true;
                    return this.$store.state.panels.showParamsAndSettings;
                },
                set(value) {
                    this.$store.commit('panels/setShowParamsAndSettings', value);
                }
            },
            showIndexSelector: {
                get() {
                    if (this.$store.state.panels.showIndexSelector === undefined) return true;
                    return this.$store.state.panels.showIndexSelector;
                },
                set(value) {
                    this.$store.commit('panels/setShowIndexSelector', value);
                }
            },
            showResultTabs: {
                get() {
                    if (this.$store.state.panels.showResultTabs === undefined) return true;
                    return this.$store.state.panels.showResultTabs;
                },
                set(value) {
                    this.$store.commit('panels/setShowResultTabs', value);
                }
            },
            showQueryInfo: {
                get() {
                    if (this.$store.state.panels.showQueryInfo === undefined) return true;
                    return this.$store.state.panels.showQueryInfo;
                },
                set(value) {
                    this.$store.commit('panels/setShowQueryInfo', value);
                }
            },
        }
    }
</script>
