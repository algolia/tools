<template>
    <div class="text-telluric-blue">
        <div class="flex justify-center">
            <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 px-16 py-8">
                <div>
                    <label>
                        <input type="checkbox" v-model="filterUntouched">
                        Untouched: {{differ.stats[resourceName].untouched}} ({{differ.stats[resourceName].untouchedPercentage}}%)
                    </label>
                </div>
                <div class="mt-16">
                    <label>
                        <input type="checkbox" v-model="filterAdded">
                        Added: {{differ.stats[resourceName].added}} ({{differ.stats[resourceName].addedPercentage}}%)
                    </label>
                </div>
                <div>
                    <label>
                        <input type="checkbox" v-model="filterRemoved">
                        Deleted: {{differ.stats[resourceName].removed}} ({{differ.stats[resourceName].removedPercentage}}%)
                    </label>
                </div>
                <div>
                    <label>
                        <input type="checkbox" v-model="filterModified">
                        Modified: {{differ.stats[resourceName].modified}} ({{differ.stats[resourceName].modifiedPercentage}}%)
                    </label>
                </div>
            </div>
        </div>
        <div class="flex py-12 items-center justify-center">
            <div :class="{invisible: differ.isComplete || loading}" v-if="resourceName === 'records'">
                <button
                    @click="loadMore"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Load 1000 more records
                </button>
            </div>
            <div class="mr-16" :class="{invisible: differ.isComplete || loading}" v-if="resourceName === 'records'">
                <button
                    @click="loadAll"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Load all records
                </button>
            </div>
            <div class="ml-16" :class="{invisible: loading}" v-if="resourceName !== 'settings'">
                <button
                    @click="$root.$emit('onForceExpandAll')"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Expand all diffs
                </button>
            </div>
            <div :class="{invisible: loading}" v-if="resourceName !== 'settings'">
                <button
                    @click="$root.$emit('onForceCollapseAll')"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Collapse all diffs
                </button>
            </div>
        </div>
        <div class="flex py-12">
            <div class="flex w-half ml-32">
                <div><span class="capitalize">{{resourceName}}</span> loaded:</div>
                <div class="ml-4">{{differ.A.ids[resourceName].length}}</div>
                <div v-if="resourceName === 'records'">/{{differ.A.nbHits[resourceName]}}</div>
            </div>
            <div class="flex w-half ml-32">
                <div><span class="capitalize">{{resourceName}}</span> loaded:</div>
                <div class="ml-4">{{differ.B.ids[resourceName].length}}</div>
                <div v-if="resourceName === 'records'">/{{differ.B.nbHits[resourceName]}}</div>
            </div>
        </div>
        <object-diff :key="diff.value" :diff="diff" v-for="diff in filteredDiff" />
        <div class="flex justify-center">
            <pagination
                @onUpdatePage="page = $event"
                :page="page"
                :nb-pages="Math.floor(diffs.length / hitsPerPage)"
            />
        </div>
    </div>
</template>

<script>
    import ObjectDiff from "@/index-differ/ObjectDiff";
    import Pagination from "common/components/explorer/results/Pagination";

    export default {
        name: 'ObjectsDiff',
        components: {ObjectDiff, Pagination},
        props: ['differ', 'resourceName'],
        data: function () {
            return {
                filterAdded: true,
                filterRemoved: true,
                filterModified: true,
                filterUntouched: true,
                loading: false,
                hitsPerPage: 100,
                page: 0,
            }
        },
        computed: {
            filteredDiff: function () {
                return this.diffs.slice(this.page * this.hitsPerPage, (this.page + 1) * this.hitsPerPage);
            },
            diffs: function () {
                if (this.filterAdded && this.filterRemoved && this.filterModified && this.filterUntouched) {
                    return this.differ.diffs[this.resourceName].slice().sort((a, b) => {
                        if (a.added > b.added) return -1;
                        if (a.removed > b.removed) return -1;
                        if (a.modified > b.modified) return -1;
                        return a.untouched - b.untouched;
                    });
                } else {
                    return this.differ.diffs[this.resourceName].filter((diff) => {
                        return (diff.added && this.filterAdded)
                            || (diff.removed && this.filterRemoved)
                            || (diff.modified && this.filterModified)
                            || (diff.untouched && this.filterUntouched);
                    }).sort((a, b) => {
                        if (a.added > b.added) return 1;
                        if (a.removed > b.removed) return 1;
                        if (a.modified > b.modified) return 1;
                        return a.untouched - b.untouched;
                    });
                }
            },
        },
        methods: {
            loadMore: function () {
                this.loading = true;
                this.page = 0;
                if (this.resourceName === 'records') {
                    this.differ.records().then(() => {
                        this.loading = false;
                    });
                }
            },
            loadAll: function () {
                this.loading = true;
                this.page = 0;
                if (this.resourceName === 'records') {
                    this.differ.allRecords().then(() => {
                        this.loading = false;
                    });
                }
            }
        }
    }
</script>

<style
