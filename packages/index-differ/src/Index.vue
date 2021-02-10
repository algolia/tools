<template>
    <div v-if="differ">
        <loaded-info
            class="px-16"
            :differ="differ"
            :current-tab="currentTab"
        />
        <index-stats :differ="differ" :resource-name="currentTab" />
        <div class="flex py-12 items-center justify-end">
            <div class="ml-16">
                <div
                    @click="$root.$emit('onForceExpandAll')"
                    class="cursor-pointer text-nebula-blue hover:underline"
                >
                    Expand all
                </div>
            </div>
            <div>
                <button
                    @click="$root.$emit('onForceCollapseAll')"
                    class="cursor-pointer text-nebula-blue hover:underline mx-16"
                >
                    Collapse all
                </button>
            </div>
        </div>
        <object-diff :key="diff.value" :diff="diff" v-for="diff in paginatedDiff" />
        <div class="flex justify-center">
            <pagination
                @onUpdatePage="page = $event"
                :page="page"
                :nb-pages="Math.ceil(diffs.length / hitsPerPage)"
            />
        </div>
    </div>
</template>

<script>
    import {getClient} from "common/utils/algoliaHelpers";
    import Differ from "./index-differ/differ";
    import ObjectDiff from "./index-differ/ObjectDiff";
    import {IndexLoader} from "./index-differ/IndexLoader";
    import IndexStats from "./index-differ/IndexStats";
    import Pagination from "common/components/explorer/results/Pagination";
    import LoadedInfo from "./index-differ/LoadedInfo";
    import sleep from "common/utils/time";

    const loaders = {};
    const lock = {};

    async function getLoader(appId, indexName, apiKey) {
        const key = `${appId}-${indexName}`;
        while (lock[key]) {
            await sleep(10);
        }

        if (loaders[key]) return loaders[key];

        lock[key] = true;

        const client = await getClient(appId, apiKey);
        const index = client.customInitIndex(indexName);

        loaders[key] = new IndexLoader(index);
        lock[key] = false;

        return loaders[key];
    }

    export default {
        name: 'Index',
        props: ['appId', 'indexName', 'refAppId', 'refIndexName', 'currentTab', 'filters'],
        components: {LoadedInfo, IndexStats, ObjectDiff, Pagination},
        data: function () {
            return {
                indexLoader: null,
                refIndexLoader: null,
                differ: null,
                hitsPerPage: 100,
                page: 0,
            }
        },
        created: async function () {
            this.$root.$on('resetPage', () => this.page = 0);
            this.$root.$on('onUpdateBrowseParams', (params) => {
                this.differ.setBrowseObjectsParams(params);
            });

            const promises = [
                this.getRefIndexLoader(),
                this.getIndexLoader(),
            ];
            await Promise.all(promises);
            this.loadDiffer();
        },
        watch: {
            filters: {
                deep: true,
                handler: function () {
                    this.page = 0;
                }
            },
            appId: async function () {
                await this.getIndexLoader();
                this.loadDiffer();
                this.$emit('onIndexChanged');
            },
            indexName: async function () {
                await this.getIndexLoader();
                this.loadDiffer();
                this.$emit('onIndexChanged');
            },
            refAppId: async function () {
                await this.getRefIndexLoader();
                this.loadDiffer();
            },
            refIndexName: async function () {
                await this.getRefIndexLoader();
                this.loadDiffer();
            },
        },
        computed: {
            paginatedDiff: function () {
                return this.diffs.slice(this.page * this.hitsPerPage, (this.page + 1) * this.hitsPerPage);
            },
            diffs: function () {
                if (this.filterAdded && this.filterRemoved && this.filterModified && this.filterUntouched) {
                    return this.differ.diffs[this.currentTab];
                } else {
                    return this.differ.diffs[this.currentTab].filter((diff) => {
                        return (diff.added && this.filters.added)
                            || (diff.removed && this.filters.removed)
                            || (diff.modified && this.filters.modified)
                            || (diff.untouched && this.filters.untouched);
                    });
                }
            },
        },
        methods: {
            loadDiffer: function () {
                if (!this.refIndexLoader || !this.indexLoader) return null;
                this.differ = new Differ(this.refIndexLoader, this.indexLoader);
                this.differ.load();
            },
            getRefIndexLoader: async function () {
                if (!this.refAppId || !this.refIndexName) return null;
                this.refIndexLoader = await getLoader(this.refAppId, this.refIndexName, this.adminAPIKey(this.refAppId));
            },
            getIndexLoader: async function () {
                if (!this.appId || !this.indexName) return null;
                this.indexLoader = await getLoader(this.appId, this.indexName, this.adminAPIKey(this.appId));
            },
            adminAPIKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
        },
    }
</script>
