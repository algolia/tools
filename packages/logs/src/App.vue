<template>
    <internal-app>
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
                        placeholder="Search logs below"
                        v-model="query"
                    >
                </div>
                <div class="flex mt-8 text-telluric-blue">
                    <span class="mr-8">Search in:</span>

                    <input type="checkbox" id="all" name="all" class="mr-4" v-model="allFieldsChecked" checked>
                    <label for="all" class="mr-8">all</label>

                    <span v-for="key in Object.keys(searchFields)">
                        <input type="checkbox" :id="key" :name="key" class="mr-4" v-model="searchFields[key]" :disabled="allFieldsChecked" checked>
                        <label :for="key" class="mr-8">{{key}}</label>
                    </span>
                </div>
                <div class="rounded border border-proton-grey-opacity-60 mt-24">
                    <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                        <app-selector v-model="appId" class="mr-16" />
                        <server-selector :app-id="appId" v-model="server" :display-all-option="true" :display-main-cluster="true" class="mr-16" />
                        <index-selector
                            v-model="indexName"
                            :app-id="appId"
                            :forced-indices="[{name: 'All Indices'}]"
                            class="mr-16"
                        />
                        <custom-select
                            v-model="logsType"
                            :options="Object.keys(logsTypes)"
                            class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4 min-w-140"
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
                            v-for="(log, index) in paginatedLogs"
                            :key="log.id"
                            :log-item="log"
                            :now-date="nowDate"
                            class="border-t border-b border-proton-grey-opacity-20"
                        />
                        <div v-if="paginatedLogs.length <= 0" class="p-8">
                            No logs found
                        </div>
                        <div v-if="paginatedLogs.length <= 0 && query.length > 0" class="p-8 flex items-center">
                            <input type="checkbox" v-model="stopIfFound"/>
                            <div class="ml-4">Stop Refreshing when found</div>
                            <input class="ml-4 input-custom inline" type="number" min="1" max="1000" v-model.number="shouldFoundN"/>
                            <div class="ml-4">hits</div>
                        </div>
                        <div class="flex justify-center pb-12" v-if="logs.length > 0">
                            <pagination
                                @onUpdatePage="page = $event"
                                :page="page"
                                :nb-pages="Math.ceil(logs.length / hitsPerPage)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import LogItem from "@/api-logs/LogItem";
    import Log from "@/api-logs/Log";
    import AppHeader from "common/components/header/AppHeader";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import ServerSelector from "common/components/selectors/ServerSelector";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import AppManagement from "common/components/configuration/AppManagement";
    import Pagination from "common/components/explorer/results/Pagination";
    import DisplayConfig from "@/api-logs/DisplayConfig";

    import {getSearchClient} from "common/utils/algoliaHelpers";

    import RefreshCw from 'common/icons/refresh-cw.svg';
    import SearchIcon from 'common/icons/search.svg';
    import getClusterList from "common/components/selectors/getClusterList";

    export default {
        name: 'ApiLogs',
        components: {InternalApp, DisplayConfig, AppHeader, AppSelector, Log, AppManagement, RefreshCw, SearchIcon, IndexSelector, ServerSelector, CustomSelect, Pagination},
        data: function () {
            return {
                query: '',
                logs: [],
                last1000Logs: [],
                logsType: 'all',
                logsTypes: {
                    'all': 'All logs',
                    'query': 'Query logs',
                    'build': 'Build logs',
                    'error': 'Error logs',
                },
                interval: null,
                stopIfFound: false,
                shouldFoundN: 1,
                page: 0,
                hitsPerPage: 100,
                nowDate: new Date(),
                fetchIsOn: true,
                searchFields: {
                  query: true,
                  body: true,
                  response: true,
                  userAgent: true,
                  apiKey: true,
                  url: true,
                  ip: true,
                },
                servers: ['-1'],
                serversNeedsUpdates: false,
            };
        },
        watch: {
            logsType: function (n, o) { if (n === o) return; this.fetchLogs(true) },
            logs: function (val) {
                if (this.stopIfFound && val.length > 0 && this.logs.length >= Math.min(1000, this.shouldFoundN)) {
                    this.stopInterval();
                    this.stopIfFound = false;
                }
            },
            page: function () {
                if (this.page > 0) this.stopInterval();
            },
            query: function () {
                this.logs = this.filterLogs(this.last1000Logs);
            },
            searchFields: {
                deep: true,
                handler: function () {
                    this.logs = this.filterLogs(this.last1000Logs);
                }
            },
            allFieldsChecked: function () {
                this.logs = this.filterLogs(this.last1000Logs);
            }
        },
        created: async function () {
            if (!this.appId && Object.keys(this.$store.state.apps).length > 0) {
                this.appId = Object.keys(this.$store.state.apps)[0];
            }

            await this.fetchServers();

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
                    this.fetchIsOn = false;
                    this.serversNeedsUpdates = true;
                    this.$store.commit('apilogs/setAppId', val);
                    this.$nextTick(() => {
                        this.fetchIsOn = true;
                        this.indexName = 'All Indices';
                    });
                },
            },
            indexName: {
                get () {
                    return this.$store.state.apilogs.indexName || null;
                },
                set (val) {
                    this.$store.commit('apilogs/setIndexName', val);
                    if (this.fetchIsOn) {
                        this.fetchLogs(true);
                    }
                }
            },

            server: {
                get () {
                    return this.$store.state.apilogs.server || 'all';
                },
                set (val) {
                    this.$store.commit('apilogs/setServer', val);
                    if (this.fetchIsOn) {
                        this.fetchLogs(true);
                    }
                },
            },
            allFieldsChecked: {
                get () {
                    return Object.keys(this.searchFields).every(field => this.searchFields[field]);
                },
                set (isChecked) {
                    if (isChecked) {
                        Object.keys(this.searchFields).forEach(field => this.searchFields[field] = true);
                    }
                    else {
                        Object.keys(this.searchFields).forEach(field => this.searchFields[field] = false);
                    }
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId].key;
            },
            paginatedLogs: function () {
                return this.logs.slice(this.page * this.hitsPerPage, (this.page + 1) * this.hitsPerPage);
            },
        },
        methods: {
            startInterval: function () {
                this.interval = window.setInterval(async () => {
                    this.fetchLogs();
                }, 3000);
            },
            stopInterval: function () {
                window.clearInterval(this.interval);
                this.interval = null;
            },
            fetchServers: async function () {
                this.servers = await getClusterList(this.appId, true);
            },
            fetchLogs: async function (resetLogs) {
                if (resetLogs) this.logs = [];

                if (!this.appId) return;

                await this.fetchServers();

                const options = {
                    offset: 0,
                    length: 1000,
                    type: this.logsType,
                };

                if (!this.allIndices) {
                    options.indexName = this.indexName;
                }

                const logs = [];

                if (this.server === 'all') {
                    const promises = [];
                    for (let i = 0; i < this.servers.length; i++) {
                        const client = await getSearchClient(this.appId, this.apiKey, this.servers[i]);
                        promises.push(client.getLogs(options));
                    }
                    const responses = await Promise.all(promises);
                    
                    responses.forEach((res, i) => {
                        logs.push(...res.logs.map(logItem => new LogItem(logItem, this.servers[i])));
                    });

                    logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
                } else {
                    const mainCluster = this.servers.length > 0 ? this.servers[0] : -1;
                    const server = this.server === 'main cluster' ? mainCluster : this.server;
                    const client = await getSearchClient(this.appId, this.apiKey, server);
                    const res = await client.getLogs(options);
                    logs.push(...res.logs.map(logItem => new LogItem(logItem, server)));
                }

                this.last1000Logs = Object.freeze(logs);
                this.nowDate = new Date();

                const filteredLogs = this.filterLogs(logs);

                if (filteredLogs.length > 0) {
                    const lastLog = filteredLogs[filteredLogs.length - 1];
                    const lastLogPos = this.logs.findIndex((log) => log.id === lastLog.id);

                    const maxNbLogs = 1000 * this.servers.length;
                    const logsCopy = this.logs.slice();
                    logsCopy.splice(0, lastLogPos + 1, ...filteredLogs);
                    logsCopy.splice(maxNbLogs);
                    this.logs = Object.freeze(logsCopy);
                }
            },
            filterLogs: function (logs) {
                if (this.query.length === 0) return logs;

                const allFieldsChecked = this.allFieldsChecked; // caching computation

                return logs.filter(log => {
                    if (allFieldsChecked) {
                        return log.rawLogString.includes(this.query);
                    }
                    else if (this.searchFields.query && log.getQueries().some(query => query.includes(this.query))) {
                        return true;
                    }
                    else if (this.searchFields.body && log.params.rawBody.includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.response && log.response.includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.userAgent && log.params.all['x-algolia-agent'] && log.params.all['x-algolia-agent'].includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.userAgent && log.params.all['user-agent'] && log.params.all['user-agent'].includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.userAgent && log.params.all['X-Algolia-Agent'] && log.params.all['X-Algolia-Agent'].includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.userAgent && log.params.all['User-Agent'] && log.params.all['User-Agent'].includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.apiKey && log.params.headers['X-Algolia-Api-Key'] && log.params.headers['X-Algolia-Api-Key'].includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.apiKey && log.params.all['x-algolia-api-key'] && log.params.all['x-algolia-api-key'].includes(this.query)) {
                        return true;
                    }
                    else if (this.searchFields.url && log.url.includes(this.query)) {
                        return true;
                    }
                    else {
                        return this.searchFields.ip && log.ip.includes(this.query);
                    }
                });
            },
        }
    }
</script>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Hind:400,600");
    @import "./src/assets/css/main";
</style>
