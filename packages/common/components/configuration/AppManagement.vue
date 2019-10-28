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
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">API Key</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">App name</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal">App owner</th>
                        <th class="p-8 text-xs uppercase tracking-wide font-normal"></th>
                    </tr>
                    <tr v-for="(app, appId) in apps">
                        <td class="p-8">{{appId}}</td>
                        <td class="p-8">
                            <span v-if="app.key">
                                {{app.key.substring(0, 4) + app.key.substring(4).replace(/./g, '*')}}
                            </span>
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
                                placeholder="apiKey"
                                v-model="newApiKey"
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

    export default {
        name: 'AppManagement',
        components: {TrashIcon, CloseIcon},
        data: function () {
            return {
                newAppId: "",
                newApiKey: "",
            }
        },
        created: function () {
            if (this.appIds.length > 0 && !this.apps[this.appIds[0]].__app_owner) {
                this.fetchAppsInfo();
            }
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
                    this.$store.commit("apps/addAppId", {
                        appId: this.newAppId,
                        apiKey: this.newApiKey
                    });
                    this.newAppId = "";
                    this.newApiKey = "";
                    this.fetchAppsInfo();
                }
            },
            deleteApp: function (appId) {
                this.$store.commit('apps/deleteAppId', appId);
            },
            fetchAppsInfo: async function () {
                const apps = Object.keys(this.apps);
                const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://algolia-apps-backend.herokuapp.com';
                const res = await fetch(`${backendEnpoint}/apps/${apps.join(',')}`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const json = await res.json();

                json.forEach((appInfo) => {
                    this.$store.commit("apps/addAppId", { appId: appInfo.application_id, apiKey: this.apps[appInfo.application_id].key });
                    this.$store.commit(`apps/${appInfo.application_id}/setAppName`, appInfo.name);
                    this.$store.commit(`apps/${appInfo.application_id}/setAppOwner`, appInfo.user.email);
                });
            }
        }
    }
</script>
