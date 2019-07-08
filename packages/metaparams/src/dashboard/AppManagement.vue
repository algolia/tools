<template>
    <div class="flex">
        <div class="rounded bg-white m-16 mr-64 border border-solid border-proton-grey-opacity-60">
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                <div>Manage Apps</div>
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
                    <tr v-for="(app, appId) in $store.state.apps">
                        <td class="p-8">{{appId}}</td>
                        <td class="p-8">
                            <span v-if="app.key">
                                {{app.key.substring(0, 4) + app.key.substring(4).replace(/./g, '*')}}
                            </span>
                        </td>
                        <td class="p-8">
                            <trash-icon class="w-12 h-12 cursor-pointer" @click="deleteApp(appId)" />
                        </td>
                    </tr>
                    <tr>
                        <td class="p-8">
                            <input
                                class="w-full bg-proton-grey-opacity-20 p-4"
                                placeholder="appId"
                                v-model="newAppId"
                                @keyup.enter="addAppId"
                            >
                        </td>
                        <td class="p-8">
                            <input
                                class="w-full bg-proton-grey-opacity-20 p-4"
                                placeholder="apiKey"
                                v-model="newApiKey"
                                @keyup.enter="addAppId"
                            >
                        </td>
                        <td class="p-8">
                            <button @click="addAppId">Add</button>
                        </td>
                    </tr>
                </table>

            </div>
        </div>
    </div>
</template>

<script>
    import TrashIcon from 'common/icons/trash.svg';
    import CloseIcon from 'common/icons/x.svg';

    export default {
        name: 'AppManagement',
        components: {TrashIcon, CloseIcon},
        data: function () {
            return {
                newAppId: "",
                newApiKey: "",
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
                }
            },
            deleteApp: function (appId) {
                this.$store.commit('apps/deleteAppId', appId);
            },
        }
    }
</script>