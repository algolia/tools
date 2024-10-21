<template>
  <div
    v-if="$store.state.panels.manageAppsPanel || Object.keys($store.state.apps).length <= 0"
    class="flex"
  >
    <div class="rounded bg-white m-16 mr-64 border border-solid border-proton-grey-opacity-60">
      <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey p-8 bg-proton-grey-opacity-80">
        <div>Manage AppIDs</div>
        <close-icon
          class="cursor-pointer ml-auto w-12 h-12"
          @click="$store.commit('panels/setManageAppsPanel', false)"
        />
      </div>
      <div>
        <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 m-8 p-8">
          <p>
            To function this app requires Algolia credentials. For most usage, a read-only API Key is sufficient.
            If you need to modify the data, you will need a write API Key.
          </p>
          <p>
            <strong>
              Always assess if the key you are using is using the least amount of privileges necessary for your needs:
            </strong>
          </p>
          <details
            open
            class="mt-8"
          >
            <summary>General</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">listIndices</code> (optional) You can search for indices in the index input instead of just typing your index name.
                </li>
              </ul>
            </div>
          </details>
          <details
            :open="currentTool == 'metaparams'"
            class="mt-8"
          >
            <summary>Metaparams</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-proton-grey p-4 rounded">search</code> You can compare the query behavior between two known indices
                </li>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">settings</code> (optional) You can check the settings, synonyms and rules for an index
                </li>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">listIndices</code> (optional) You can see application stats.
                </li>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">analytics</code> (optional) You can get top queries in the search bar.
                </li>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">browse</code> (optional) You can switch the search bar mode to browse.
                </li>
                <li class="leading-normal">
                  <code class="text-xs bg-mars-1 text-white p-4 rounded">setSettings</code> (optional) You can <em>modify</em> the settings, synonyms and rules for an index
                </li>
              </ul>
            </div>
          </details>
          <details
            :open="currentTool == 'relevance-testing'"
            class="mt-8"
          >
            <summary>Relevance testing</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-proton-grey p-4 rounded">search</code>
                </li>
              </ul>
            </div>
          </details>
          <details
            :open="currentTool == 'index-differ'"
            class="mt-8"
          >
            <summary>Index Differ</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">settings</code> (optional) You can compare the settings, synonyms and rules between indices
                </li>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">browse</code> (optional) You can compare the records between indices
                </li>
              </ul>
            </div>
          </details>
          <details
            :open="currentTool == 'logs'"
            class="mt-8"
          >
            <summary>Realtime logs</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-saturn-1 text-white p-4 rounded">logs</code>
                </li>
              </ul>
            </div>
          </details>
          <details
            :open="currentTool == 'transform'"
            class="mt-8"
          >
            <summary>Transform</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-proton-grey p-4 rounded">search</code>, <code class="text-xs bg-saturn-1 text-white p-4 rounded">browse</code> and <code class="text-xs bg-mars-1 text-white p-4 rounded">addObject</code>
                </li>
              </ul>
            </div>
          </details>
          <details
            :open="currentTool == 'index-analyzer'"
            class="mt-8"
          >
            <summary>Index Analyzer</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-proton-grey p-4 rounded">search</code> and <code class="text-xs bg-saturn-1 text-white p-4 rounded">browse</code>
                </li>
              </ul>
            </div>
          </details>
          <details
            :open="currentTool == 'insights-ui'"
            class="mt-8"
          >
            <summary>Insights UI</summary>
            <div class="p-8">
              <ul>
                <li class="leading-normal">
                  <code class="text-xs bg-proton-grey p-4 rounded">search</code> You can send events
                </li>
                <li class="leading-normal">
                  <code class="text-xs bg-mars-1 text-white p-4 rounded">recommendation</code> (optional) You can send events based on Personalization's settings
                </li>
              </ul>
            </div>
          </details>
        </div>
        <table>
          <tr class="text-left">
            <th class="p-8 text-xs uppercase tracking-wide font-normal">
              App ID
            </th>
            <th class="p-8 text-xs uppercase tracking-wide font-normal">
              API Key
            </th>
            <th class="p-8 text-xs uppercase tracking-wide font-normal">
              Key type
            </th>
            <th class="p-8 text-xs uppercase tracking-wide font-normal">
              App name
            </th>
            <th class="p-8 text-xs uppercase tracking-wide font-normal">
              App owner
            </th>
            <th class="p-8 text-xs uppercase tracking-wide font-normal" />
          </tr>
          <tr
            v-for="(app, appId) in apps"
            :key="appId"
          >
            <td class="p-8">
              <a
                v-if="app.__app_uid"
                target="_blank"
                :href="`https://admin.algolia.com/admin/users/${app.__app_uid}/applications/${appId}`"
                class="text-nebula-blue cursor-pointer hover:underline"
              >
                {{ appId }}
              </a>
              <span v-else>{{ appId }}</span>
            </td>
            <td class="p-8">
              <edit-key
                :app-id="appId"
                key-name="key"
              />
            </td>
            <td class="p-8">
              {{ app.__app_name }}
            </td>
            <td class="p-8">
              {{ app.__app_owner }}
            </td>
            <td class="p-8">
              <trash-icon
                class="w-12 h-12 cursor-pointer"
                @click="deleteApp(appId)"
              />
            </td>
          </tr>
          <tr>
            <td class="p-8 pt-32">
              <input
                v-model="newAppId"
                class="w-full bg-proton-grey-opacity-20 p-4"
                placeholder="appId"
                @keyup.enter="addAppId"
              >
            </td>
            <td class="p-8 pt-32">
              <input
                v-model="newApiKey"
                class="w-full bg-proton-grey-opacity-20 p-4"
                placeholder="API Key"
                @keyup.enter="addAppId"
              >
            </td>
            <td class="p-8 pt-32">
              <button @click="addAppId">
                Add
              </button>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
    import TrashIcon from '../../icons/trash.svg';
    import CloseIcon from '../../icons/x.svg';
    import EditKey from "./EditKey.vue";
    import {getApplicationsIndex} from "../selectors/getClusterList";

    export default {
        name: 'AppManagement',
        components: {EditKey, TrashIcon, CloseIcon},
        data: function () {
            return {
                newAppId: "",
                newApiKey: "",
            }
        },
        computed: {
            apps: function () {
                return this.$store.state.apps;
            },
            appIds: function () {
                return Object.keys(this.apps);
            },
            currentTool: function() {
                return window.location.pathname.split("/")[1] || 'unknown'
            }
        },
        created: function () {
            this.fetchAppsInfo();
            this.$root.$on('onFetchAppsInfo', () => this.fetchAppsInfo());
        },
        methods: {
            addAppId: function() {
                if (this.newAppId.length > 0 && this.newApiKey.length > 0) {
                    this.$store.commit("apps/addAppId", this.newAppId);
                    this.$store.commit(`apps/${this.newAppId}/setKey`, { keyName: 'key', value: this.newApiKey });
                    this.$emit('onAddedAppId', this.newAppId);
                    this.newAppId = "";
                    this.newApiKey = "";
                    this.fetchAppsInfo();
                }
            },
            deleteApp: function (appId) {
                this.$store.commit('apps/deleteAppId', appId);
            },
            getAppsDashboardInfo: async function () {
                const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT;
                const res = await fetch(`${backendEnpoint}/apps/${this.appIds.join(',')}`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                return await res.json();
            },
            fetchAppsInfo: async function () {
                const appIds = Object.keys(this.apps);

                if (appIds.length <= 0) return; // Avoid registering first apps of index.

                /*
                 * Algolia only code. This will not be used if you are not part of the Algolia org.
                 */
                const index = await getApplicationsIndex();
                if (index) {
                    const res = await index.search('', {
                        facetFilters: [appIds.map((appId) => `application_id:${appId}`)],
                    });

                    res.hits.forEach((appInfo) => {
                        this.$store.commit("apps/addAppId", appInfo.application_id);
                        this.$store.commit(`apps/${appInfo.application_id}/setAppName`, appInfo.name);
                        this.$store.commit(`apps/${appInfo.application_id}/setAppOwner`, appInfo.user_email);
                        this.$store.commit(`apps/${appInfo.application_id}/setUId`, appInfo.user_id);
                    });

                    const res2 = await this.getAppsDashboardInfo();
                    res2.forEach((appInfo) => {
                        this.$store.commit(`apps/${appInfo.application_id}/setLogRegion`, appInfo.log_region);
                    });
                }
            }
        }
    }
</script>
