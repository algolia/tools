<template>
    <div v-if="$store.state.panels.manageAppsPanel || Object.keys($store.state.apps).length <= 0" class="flex">
        <div class="rounded bg-white m-16 mr-64 border border-solid border-proton-grey-opacity-60">
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                <div>Manage AppIDs</div>
                <close-icon
                    class="cursor-pointer ml-auto w-12 h-12"
                    @click="$store.commit('panels/setManageAppsPanel', false)"
                />
            </div>
            <div>
                <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 m-8 p-8">
                    To function this app requires Algolia credentials. You must provide the Admin API Key for every feature to work properly.
                </div>
                <table>
                    <tr class="text-left">
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">App ID</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">Admin API Key</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">Usage API Key</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">App name</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">App owner</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal"></th>
                    </tr>
                    <tr v-for="(app, appId) in apps">
                        <td class="p-8">
                            <a
                                v-if="app.__app_uid"
                                target="_blank"
                                :href="`https://admin.algolia.com/admin/users/${app.__app_uid}/applications/${appId}`"
                                class="text-nebula-blue cursor-pointer hover:underline"
                            >
                                {{appId}}
                            </a>
                            <span v-else>{{appId}}</span>
                        </td>
                        <td class="p-8">
                            <edit-key :app-id="appId" key-name="key" />
                        </td>
                        <td class="p-8">
                            <edit-key :app-id="appId" key-name="ukey" />
                        </td>
                        <td class="p-8">{{app.__app_name}}</td>
                        <td class="p-8">{{app.__app_owner}}</td>
                        <td class="p-8">
                            <trash-icon class="w-12 h-12 cursor-pointer" @click="deleteApp(appId)" />
                        </td>
                    </tr>
                    <tr>
                        <td class="p-8 pt-32">
                            <input
                                class="w-full bg-proton-grey-opacity-20 p-4"
                                placeholder="appId"
                                v-model="newAppId"
                                @keyup.enter="addAppId"
                            >
                        </td>
                        <td class="p-8 pt-32">
                            <input
                                class="w-full bg-proton-grey-opacity-20 p-4"
                                placeholder="Admin apiKey"
                                v-model="newApiKey"
                                @keyup.enter="addAppId"
                            >
                        </td>
                        <td class="p-8 pt-32">
                            <input
                                class="w-full bg-proton-grey-opacity-20 p-4"
                                placeholder="Usage apiKey"
                                v-model="newUsageApiKey"
                                @keyup.enter="addAppId"
                            >
                        </td>
                        <td class="p-8 pt-32">
                            <button @click="addAppId">Add</button>
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
    import EditKey from "./EditKey";
    import {getKey} from "../selectors/getClusterList";
    import algoliasearch from 'algoliasearch';

    export default {
        name: 'AppManagement',
        components: {EditKey, TrashIcon, CloseIcon},
        data: function () {
            return {
                newAppId: "",
                newApiKey: "",
                newUsageApiKey: "",
            }
        },
        created: function () {
            this.fetchAppsInfo();
            this.$root.$on('onFetchAppsInfo', () => this.fetchAppsInfo());
        },
        computed: {
            apps: function () {
                return this.$store.state.apps;
            },
            appIds: function () {
                return Object.keys(this.apps);
            }
        },
        methods: {
            addAppId: function() {
                if (this.newAppId.length > 0 && this.newApiKey.length > 0) {
                    this.$store.commit("apps/addAppId", this.newAppId);
                    this.$store.commit(`apps/${this.newAppId}/setKey`, { keyName: 'key', value: this.newApiKey });
                    this.$store.commit(`apps/${this.newAppId}/setKey`, { keyName: 'ukey', value: this.newUsageApiKey });
                    this.$emit('onAddedAppId', this.newAppId);
                    this.newAppId = "";
                    this.newApiKey = "";
                    this.newUsageApiKey = "";
                    this.fetchAppsInfo();
                }
            },
            deleteApp: function (appId) {
                this.$store.commit('apps/deleteAppId', appId);
            },
            getAppsDashboardInfo: async function () {
                const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
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

                const key = await getKey();
                const client = algoliasearch('X20GSLY1CL', key);
                const index = client.initIndex('applications_production');

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
</script>
