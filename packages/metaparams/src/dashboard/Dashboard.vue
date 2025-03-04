<template>
  <div
    class="m-16"
    :class="panelKey === 'leftPanel' ? 'mr-8' : 'ml-8'"
  >
    <search-box
      v-if="!$store.state.panels.splitMode || $store.state.panels.twoInputs"
      :panel-key="panelKey"
    />
    <div class="mt-16 rounded bg-white border border-solid border-proton-grey-opacity-60">
      <div
        v-if="$store.state.panels.showIndexSelector"
        class="px-8 py-8 pb-12 border-b border-nova-grey-opacity-20"
        :class="{
          'bg-proton-grey-opacity-80': isOwner(appId),
          'bg-saturn-5': !isOwner(appId) && !forceWrite,
          'bg-mars-1-opacity-50': !isOwner(appId) && forceWrite,
        }"
      >
        <div class="flex flex-wrap justify-start items-center">
          <app-selector
            v-model="appId"
            class="mb-12"
          />
          <index-selector
            v-model="indexName"
            :app-id="appId"
            class="ml-12 mb-12"
            allow-free-text="true"
          />
          <user-selector
            v-model="panelUserId"
            :app-id="appId"
            class="ml-12 mb-12"
          />

          <index-new
            v-if="canWrite"
            class="mb-12 pb-4"
            :app-id="panelAppId"
            :api-key="panelAdminAPIKey"
            @onIndexCreated="onIndexCreated"
          />
          <index-rename
            v-if="canWrite"
            class="mb-12 pb-4"
            :app-id="panelAppId"
            :api-key="panelAdminAPIKey"
            :index-name="panelIndexName"
            @onIndexRenamed="onIndexCreated"
          />
          <index-clear
            v-if="canWrite && !isReplica"
            class="mb-12 pb-4"
            :panel-key="panelKey"
            :user-id="panelUserId"
          />
          <index-delete
            v-if="canWrite && !isReplica"
            class="mb-12 pb-4"
            :panel-key="panelKey"
            :user-id="panelUserId"
          />
          <button
            v-if="$store.state.panels.splitMode && !sameIndexOnEachPanel && panelKey === 'leftPanel'"
            class="block ml-8 mb-12 pb-4 relative group"
            @click="$store.commit('panels/rightFromLeft')"
          >
            <flip-right-icon class="block w-16 h-16 text-solstice-blue fill-current" />
            <tooltip>Open this index in the right panel</tooltip>
          </button>
          <button
            v-if="$store.state.panels.splitMode && !sameIndexOnEachPanel && panelKey === 'rightPanel'"
            class="block ml-8 mb-12 pb-4 relative group"
            @click="$store.commit('panels/leftFromRight')"
          >
            <flip-left-icon class="block w-16 h-16 text-solstice-blue fill-current" />
            <tooltip>Open this index in the left panel</tooltip>
          </button>
          <server-selector
            v-model="panelServer"
            class="mb-12 ml-auto"
            :app-id="appId"
            :display-main-cluster="false"
            :display-dsn="true"
            :display-main-cluster-machines="true"
          />
          <button
            v-if="!$store.state.panels.splitMode && panelKey === 'leftPanel'"
            class="mb-12 block px-8 ml-8 py-4 border border-telluric-blue-opacity-60 rounded relative group"
            @click="$store.commit('panels/setExpandLeftPanel', !$store.state.panels.expandLeftPanel)"
          >
            <maximize-icon
              v-if="!$store.state.panels.expandLeftPanel"
              class="block w-16 h-16 text-cosmos-black-opacity-70 fill-current"
            />
            <minimize-icon
              v-if="$store.state.panels.expandLeftPanel"
              class="block w-16 h-16 text-cosmos-black-opacity-70 fill-current"
            />
            <tooltip>{{ $store.state.panels.expandLeftPanel ? 'Shrink the panel' : 'Expand the panel' }}</tooltip>
          </button>
        </div>
        <div class="flex flex-wrap">
          <div
            v-if="!isOwner(appId)"
            class="text-sm text-solstice-blue-opacity-80 mr-24"
          >
            Read-Only <input
              type="checkbox"
              :checked="!forceWrite"
              @input="forceWrite = !$event.target.checked"
            >
          </div>
          <index-info
            v-if="indexData"
            :panel-key="panelKey"
            @onUpdateHasNoRecord="hasNoRecords = $event"
          />
        </div>
      </div>
      <div v-if="indexData">
        <div class="flex">
          <div
            v-if="panelKey === 'leftPanel' && $store.state.panels.showParamsAndSettings"
            class="w-300 max-w-300 min-w-300"
          >
            <queries :panel-key="panelKey" />
            <dashboard-config
              :panel-key="panelKey"
              :read-only="!canWrite"
            />
          </div>
          <div
            :style="$store.state.panels.showParamsAndSettings ? 'width: calc(100% - 300px)' : 'width: 100%'"
            :class="{
              'border-l': panelKey === 'leftPanel' && $store.state.panels.showParamsAndSettings,
              'border-r': panelKey === 'rightPanel' && $store.state.panels.showParamsAndSettings,
            }"
            class="flex border-proton-grey"
          >
            <explorer
              v-if="panelIndexName"
              :panel-key="panelKey"
              :read-only="!canWrite"
              :has-no-records="hasNoRecords"
              class="bg-white flex-1 min-w-0"
            />
            <facets
              v-show="!$store.state.panels.splitMode || forceOpenFacets"
              class="xxl:min-w-260 xxl:max-w-260 min-w-152 max-w-152 border-l border-proton-grey"
              :panel-key="panelKey"
              :app-id="panelAppId"
              :index-name="panelIndexName"
              :search-params="searchParams"
              :query="searchParams.query !== undefined ? searchParams.query : $store.state.panels.query"
              :index-settings="refIndexSettings"
              :config-key="searchConfigKey"
            />
          </div>
          <div
            v-if="panelKey !== 'leftPanel' && $store.state.panels.showParamsAndSettings"
            class="w-300 max-w-300 min-w-300"
          >
            <queries :panel-key="panelKey" />
            <dashboard-config
              :panel-key="panelKey"
              :read-only="!canWrite"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import Explorer from "./Explorer.vue";
    import DashboardConfig from "./DashboardConfig.vue";
    import Queries from "@/queries/queries.vue";
    import IndexInfo from "@/dashboard/IndexInfo.vue";
    import IndexNew from "common/components/index/IndexNew.vue";
    import IndexRename from "common/components/index/IndexRename.vue";
    import AppSelector from "common/components/selectors/AppSelector.vue";
    import IndexSelector from "common/components/selectors/IndexSelector.vue";
    import ServerSelector from "common/components/selectors/ServerSelector.vue";
    import UserSelector from "common/components/selectors/UserSelector.vue";
    import Facets from "common/components/explorer/facets/Facets.vue";

    import FlipLeftIcon from "common/icons/flip-left.svg";
    import FlipRightIcon from "common/icons/flip-right.svg";
    import MaximizeIcon from "common/icons/maximize.svg";
    import MinimizeIcon from "common/icons/minimize.svg";
    import IndexDelete from "@/dashboard/IndexDelete.vue";
    import Tooltip from "common/components/Tooltip.vue";
    import SearchBox from "@/dashboard/SearchBox.vue";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import panelsMixin from "common/mixins/panelsMixin";

    import ownedByAlgoliaMixin from "common/mixins/ownedByAlgolia";
    import IndexClear from "./IndexClear.vue";

    export default {
        name: 'Dashboard',
        components: {
            IndexClear,
            SearchBox,
            Tooltip,
            IndexDelete,
            IndexNew,
            IndexRename,
            IndexInfo,
            AppSelector,
            IndexSelector,
            Queries,
            DashboardConfig,
            Explorer,
            FlipLeftIcon,
            FlipRightIcon,
            ServerSelector,
            MaximizeIcon,
            MinimizeIcon,
            Facets,
            UserSelector,
        },
        mixins: [indexInfoMixin, panelsMixin, ownedByAlgoliaMixin],
        props: ['panelKey'],
        data: function () {
            return {
                forceWrite: false,
                hasNoRecords: false,
            }
        },
        computed: {
            appId: { // Needed for indexInfoMixin
                get () {
                    return this.$store.state.panels[this.panelKey].appId;
                },
                set (appId) {
                    this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {appId: appId, indexName: null});
                }
            },
            indexName: { // Needed for indexInfoMixin
                get () {
                    return this.$store.state.panels[this.panelKey].indexName;
                },
                set (indexName) {
                    this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {appId: this.appId, indexName: indexName});
                }
            },
            canWrite: function () {
                const isTargetingMainCluster = ['dsn', '-dsn', '-1', '-2', '-3'].includes(this.panelServer);
                return isTargetingMainCluster && (this.forceWrite || this.isOwner(this.appId));
            },
            forceOpenFacets: function () {
                return this.searchParams.facets !== undefined;
            }
        },
        methods: {
            onIndexCreated: function (indexName) {
                this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {
                    appId: this.panelAppId,
                    indexName: indexName,
                });
            }
        }
    }
</script>
