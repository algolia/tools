<template>
    <internal-app>
        <app-header app-name="Index Size" />
        <app-management />
        <div class="max-w-960 mx-auto mt-24">
            <div class="rounded border border-proton-grey-opacity-60 mt-24">
                <div class="flex items-center bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                    <app-global-selector v-model="app" />
                    <server-selector
                        v-model="cluster"
                        :app-id="appId"
                        :display-all-clusters="true"
                        :reset-on-change-app-id="true"
                        class="ml-12"
                    />
                    <custom-select
                        v-model="machine"
                        :options="['-1', '-2', '-3']"
                        class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4 ml-12"
                    >
                        <template v-slot:default="{option}">{{option}}</template>
                    </custom-select>
                    <index-selector v-model="indexName" :app-id="appId" :allow-free-text="true" class="ml-12" />
                    <div v-if="hasRequested" class="ml-12">
                        Recompute <input type="checkbox" v-model="forceRecompute">
                    </div>
                    <div v-if="!isRequesting" @click="fetchApi" class="ml-12 cursor-pointer px-8 py-4 border border-telluric-blue-opacity-60 rounded">
                        Get
                    </div>
                </div>
                <div class="bg-white text-nova-grey p-8">
                    <div v-if="json">
                        <highlight-code lang="json" v-bind:code="json"></highlight-code>
                    </div>
                    <div v-else>
                        <div v-if="isComputing">
                            🔄 Computing the index size – be patient
                        </div>
                        <div v-else-if="isError">
                            ⚠️ Error – check params
                        </div>
                        <div v-else-if="isWaiting">
                            ⏳ Waiting for request
                        </div>
                        <div v-else="isRequesting">
                            🚀 Requesting index size
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppManagement from "common/components/configuration/AppManagement";
    import AppHeader from "common/components/header/AppHeader";

    import AppGlobalSelector from "common/components/selectors/AppGlobalSelector";
    import ServerSelector from "common/components/selectors/ServerSelector";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import IndexSelector from "common/components/selectors/IndexSelector";

    export default {
        name: 'app',
        components: {InternalApp, AppManagement, AppHeader, AppGlobalSelector, ServerSelector, CustomSelect, IndexSelector},
        data: function () {
            return {
                cluster: null,
                app: null,
                machine: '-1',
                indexName: '',
                forceRecompute: false,
                isComputing: false,
                isError: false,
                isRequesting: false,
                isWaiting: true,
                hasRequested: false,
                json: null,
            }
        },
        watch: {
            cluster: function () { this.hasRequested = false; this.forceRecompute = false; },
            appId: function () { this.hasRequested = false; this.forceRecompute = false; },
            machine: function () { this.hasRequested = false; this.forceRecompute = false; },
            indexName: function () { this.hasRequested = false; this.forceRecompute = false; },

        },
        computed: {
            appId: function () {
                return this.app ? this.app.application_id : null;
            },
        },
        methods: {
            fetchApi: async function () {
                this.json = null;
                this.isRequesting = true;
                this.isWaiting = false;

                const res = await fetch(`https://index-size.herokuapp.com/${this.forceRecompute ? 'compute' : 'get-index-size'}`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cluster: `${this.cluster}${this.machine}`,
                        appId: this.appId,
                        index: this.indexName,
                    }),
                });
                const json = await res.json();

                if (json.message) {
                    if (json.message.indexOf('Computing the index size') !== -1) {
                        this.forceRecompute = false;
                        this.isComputing = true;
                        setTimeout(() => this.fetchApi(), 5000);
                    } else if (json.message === 'No size computation available for this index') {
                        this.forceRecompute = true;
                        this.fetchApi();
                    } else if (json.message === 'Size computing is on-going. Please try again later') {
                        this.forceRecompute = false;
                        setTimeout(() => this.fetchApi(), 5000);
                    }
                } else {
                    this.forceRecompute = false;
                    this.isRequesting = false;
                    this.hasRequested = true;
                    this.isComputing = false;
                    this.isWaiting = false;
                    this.json = JSON.stringify(json, null, 2);
                }
            }
        }
    }
</script>

<style lang="css">
    code.hljs {
        padding: 1em;
        background: none;
    }
</style>
