<template>
    <div class="w-full">
        <div class="flex text-telluric-blue text-sm">
            <hits-config />
            <div class="ml-auto flex flex-wrap items-start">
                <panels-config />
                <div class="ml-auto pl-48 mb-16 mt-12">
                    <div class="mb-8">
                        <h4>Management</h4>
                </div>
                <div class="flex h-48">
                        <div
                            v-if="Object.keys($store.state.apps).length > 0"
                            class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-16"
                        >
                            <button
                                class="w-92 h-full py-8 px-16"
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
                            class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
                        >
                            <button
                                class="w-92 h-full py-8 p-16"
                                @click="manageAppsPanel = !manageAppsPanel"
                            >
                                <div>
                                    <box-icon
                                        :class="[ manageAppsPanel ? 'text-nebula-blue' : 'text-cosmos-black-opacity-60' ]"
                                        class="w-auto h-16 fill-current"
                                    />
                                </div>
                                <div class="mt-4">
                                AppIDs
                            </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import BoxIcon from "common/icons/box.svg";
    import ShareIcon from "common/icons/share.svg";

    import HitsConfig from "common/components/configuration/HitsConfig";
    import PanelsConfig from "common/components/configuration/PanelsConfig";

    export default {
        name: 'DisplayConfig',
        components: {BoxIcon, ShareIcon, HitsConfig, PanelsConfig},
        computed: {
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
