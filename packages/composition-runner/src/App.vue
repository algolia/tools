<template>
  <internal-app>
    <div class="min-h-screen">
      <app-header app-name="Composition Runner">
        <div class="w-full">
          <div class="flex text-telluric-blue text-sm">
            <div class="ml-auto pl-48 mb-16 mt-12">
              <div class="mb-8">
                <h4>Management</h4>
              </div>
              <div class="flex h-48">
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
      </app-header>
      <app-management />
      <div
        class="mx-auto mt-24 pb-24 px-16"
        style="max-width: 1400px;"
      >
        <run-form />
        <run-results />
      </div>
    </div>
  </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import BoxIcon from "common/icons/box.svg";
    import RunForm from "./components/RunForm.vue";
    import RunResults from "./components/RunResults.vue";

    export default {
        name: 'CompositionRunner',
        components: {InternalApp, AppHeader, AppManagement, BoxIcon, RunForm, RunResults},
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
