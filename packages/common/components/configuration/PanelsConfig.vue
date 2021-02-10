<template>
    <div v-if="Object.keys($store.state.apps).length > 0" class="text-telluric-blue text-sm ml-auto mb-16 mt-12">
        <div class="mb-8">
            <h4>Panels</h4>
        </div>
        <div class="flex h-48">
            <div
                class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-16"
            >
                <button
                    class="w-92 h-full py-8 px-16"
                    @click="comparePanels = !comparePanels"
                >
                    <div>
                        <compare-icon
                            :class="[ comparePanels ? 'text-nebula-blue' : 'text-cosmos-black-opacity-60' ]"
                            class="w-auto h-16 fill-current"
                        />
                    </div>
                    <div class="mt-4">
                        Hits
                    </div>
                </button>
            </div>
            <div
                v-if="!hideSplit"
                class="h-full flex items-center text-center block bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out"
            >
                <button
                    class="w-92 h-full py-8 px-16"
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
</template>

<script>
    import SplitIcon from "common/icons/split.svg";
    import CompareIcon from "common/icons/compare.svg";

    export default {
        name: 'PanelsConfig',
        components: {SplitIcon, CompareIcon},
        props: ['hideSplit'],
        computed: {
            comparePanels: {
                get() {
                    return this.$store.state.panels.comparePanels;
                },
                set(value) {
                    this.$store.commit("panels/setComparePanels", value);
                }
            },
        }
    }
</script>
