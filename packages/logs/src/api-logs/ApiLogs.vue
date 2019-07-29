<template>
    <div class="min-h-screen">
        <app-header app-name="Logs">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
        <div class="max-w-960 mx-auto mt-24 rounded border border-proton-grey-opacity-60" v-if="appId">
            <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                <app-selector
                    v-model="appId"
                    :apps="$store.state.apps"
                />
                <div class="ml-auto flex items-center">
                    <refresh-cw class="w-16 h-16" :class="{'infinte-rotate': interval}" />
                    <button class="mx-12 border border-telluric-blue-opacity-60 p-4 rounded" @click="interval ? stopInteval() : startInterval()">
                        {{interval ? 'Stop Refreshing' : 'Start Refreshing'}}
                    </button>
                </div>
            </div>
            <div class="bg-white text-nova-grey">
                <log
                    v-for="(log, index) in logs"
                    :key="log.sha1"
                    :log-item="log"
                    class="border-t border-b border-proton-grey-opacity-20"
                />
                <div v-if="logs.length <= 0" class="p-8">
                    No logs
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import algoliasearch from 'algoliasearch';
    import LogItem from "@/api-logs/LogItem";
    import Log from "@/api-logs/Log";
    import AppHeader from "common/components/header/AppHeader";
    import AppSelector from "common/components/selectors/AppSelector";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/api-logs/DisplayConfig";

    import RefreshCw from 'common/icons/refresh-cw.svg';

    export default {
        name: 'ApiLogs',
        components: {DisplayConfig, AppHeader, AppSelector, Log, AppManagement, RefreshCw},
        data: function () {
            return {
                logs: [],
                interval: null,
            };
        },
        created: function () {
            if (!this.appId && Object.keys(this.$store.state.apps).length > 0) {
                this.appId = Object.keys(this.$store.state.apps)[0];
            }

            this.fetchLogs();
            this.startInterval();
        },
        watch: {
            client: function () { this.fetchLogs() },
        },
        computed: {
            appId: {
                get () {
                    return this.$store.state.apilogs.appId;
                },
                set (val) {
                    this.$store.commit('apilogs/setAppId', val);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId].key;
            },
            client: function () {
                if (!this.appId) return null;
                return algoliasearch(this.appId, this.apiKey);
            },
        },
        methods: {
            startInterval: function () {
                this.interval = window.setInterval(async () => {
                    this.fetchLogs();
                }, 5000);
            },
            stopInteval: function () {
                window.clearInterval(this.interval);
                this.interval = null;
            },
            fetchLogs: async function () {
                const client = this.client;
                if (!client) return;

                const res = await client.getLogs({
                    offset: 0,
                    length: 1000,
                    type: 'all',
                });

                this.logs = res.logs.map((logItem) => {
                    return new LogItem(logItem);
                });
            }
        }
    }
</script>