<template>
    <div>
        <div class="flex text-telluric-blue text-sm">
            <div :class="Object.keys($store.state.apps).length > 0 ? 'ml-48': 'ml-auto'">
                <div class="mb-8">
                    <h4>Management</h4>
                </div>
                <div class="flex h-48">
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
                                AppIDs
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import BoxIcon from "common/icons/box.svg";

    export default {
        name: 'DisplayConfig',
        components: {BoxIcon},
        computed: {
            manageAppsPanel: {
                get() {
                    return this.$store.state.panels.manageAppsPanel;
                },
                set(value) {
                    this.$store.commit("panels/setManageAppsPanel", value);
                }
            },
        }
    }
</script>
