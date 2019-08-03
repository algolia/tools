<template>
    <div class="min-h-screen pb-24">
        <app-header app-name="Logs">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
        <div class="max-w-960 mx-auto mt-24" v-if="appId">
            <div class="flex items-center px-16 bg-white rounded border border-proton-grey-opacity-80">
                <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
                <input
                    class="flex-1 block h-full py-8 bg-transparent text-telluric-blue leading-normal"
                    placeholder="Search for anything"
                    v-model="query"
                >
            </div>
            <div class="rounded border border-proton-grey-opacity-60 mt-24">
                <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                    <app-selector v-model="appId" class="mr-16" />
                    <index-selector
                        v-model="indexName"
                        :app-id="appId"
                        :forced-indices="[{name: 'All Indices'}]"
                        class="mr-16"
                    />
                    <custom-select
                        v-model="logsType"
                        :options="Object.keys(logsTypes)"
                        class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 min-w-140"
                    >
                        <template v-slot:default="{option}">{{logsTypes[option]}}</template>
                    </custom-select>
                    <div class="ml-auto flex items-center">
                        <refresh-cw class="w-16 h-16" :class="{'infinte-rotate': interval}" />
                        <button class="mx-12 border border-telluric-blue-opacity-60 p-4 rounded" @click="interval ? stopInterval() : startInterval()">
                            {{interval ? 'Stop Refreshing' : 'Start Refreshing'}}
                        </button>
                    </div>
                </div>
                <div class="bg-white text-nova-grey">
                    <log
                        v-for="(log, index) in filteredLogs"
                        :key="log.sha1"
                        :log-item="log"
                        class="border-t border-b border-proton-grey-opacity-20"
                    />
                    <div v-if="filteredLogs.length <= 0" class="p-8">
                        No logs found
                    </div>
                    <div v-if="filteredLogs.length <= 0 && query.length > 0" class="p-8">
                        Stop Refreshing when found <input type="checkbox" v-model="stopIfFound"/>
                    </div>
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
    import IndexSelector from "common/components/selectors/IndexSelector";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/api-logs/DisplayConfig";

    import RefreshCw from 'common/icons/refresh-cw.svg';
    import SearchIcon from 'common/icons/search.svg';

    export default {
        name: 'ApiLogs',
        components: {DisplayConfig, AppHeader, AppSelector, Log, AppManagement, RefreshCw, SearchIcon, IndexSelector, CustomSelect},
        data: function () {
            return {
                query: '',
                logs: [],
                logsType: 'all',
                logsTypes: {
                    'all': 'All logs',
                    'query': 'Query logs',
                    'build': 'Build logs',
                    'error': 'Error logs',
                },
                interval: null,
                stopIfFound: false,
            };
        },
        watch: {
            client: function (n, o) { if (n === o) return; this.fetchLogs() },
            logsType: function (n, o) { if (n === o) return; this.fetchLogs() },
            allIndices: function (n, o) { if (n === o) return; this.fetchLogs() },
            indexName: function (n, o) { if (n === o) return; this.fetchLogs() },
            logs: function (val) {
                if (this.stopIfFound && val.length > 0 && this.filteredLogs.length > 0) {
                    this.stopInterval();
                    this.stopIfFound = false;
                }
            }
        },
        created: function () {
            if (!this.appId && Object.keys(this.$store.state.apps).length > 0) {
                this.appId = Object.keys(this.$store.state.apps)[0];
            }

            this.fetchLogs();
            this.startInterval();
        },
        computed: {
            allIndices: function () {
                return !this.indexName || this.indexName === 'All Indices';
            },
            appId: {
                get () {
                    return this.$store.state.apilogs.appId;
                },
                set (val) {
                    this.$store.commit('apilogs/setAppId', val);
                    this.$store.commit('apilogs/setIndexName', null);
                }
            },
            indexName: {
                get () {
                    return this.$store.state.apilogs.indexName || null;
                },
                set (val) {
                    this.$store.commit('apilogs/setIndexName', val);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId].key;
            },
            client: function () {
                if (!this.appId) return null;
                return algoliasearch(this.appId, this.apiKey);
            },
            filteredLogs: function () {
                if (this.query.length === 0) return this.logs;

                return this.logs.filter((log) => {
                    return log.rawLogString.indexOf(this.query) !== -1;
                });
            },
        },
        methods: {
            startInterval: function () {
                this.interval = window.setInterval(async () => {
                    this.fetchLogs();
                }, 5000);
            },
            stopInterval: function () {
                window.clearInterval(this.interval);
                this.interval = null;
            },
            fetchLogs: async function () {
                const client = this.client;
                if (!client) return;

                const options = {
                    offset: 0,
                    length: 1000,
                    type: this.logsType,
                };

                if (!this.allIndices) {
                    options.indexName = this.indexName;
                }

                const res = await client.getLogs(options);

                this.logs = res.logs.map((logItem) => {
                    return new LogItem(logItem);
                });
            }
        }
    }
</script>