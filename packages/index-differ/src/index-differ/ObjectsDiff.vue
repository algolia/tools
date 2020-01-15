<template>
    <div class="text-telluric-blue">
        <div class="flex justify-center">
            <div class="flex w-full text-nova-grey bg-moon-grey-opacity-50 border-b border-proton-grey-opacity-20 px-16 py-8">
                <div class="mr-8">
                    <label>
                        <div class="flex">
                            <input class="mr-8" type="checkbox" v-model="filterUntouched">
                            <div>
                                Untouched
                                {{differ.stats[resourceName].untouched}} ({{differ.stats[resourceName].untouchedPercentage}}%)
                            </div>
                        </div>
                    </label>
                </div>
                <div class="mx-8">
                    <label>
                        <div class="flex">
                            <input class="mr-8" type="checkbox" v-model="filterAdded">
                            <div>
                                Added
                                {{differ.stats[resourceName].added}} ({{differ.stats[resourceName].addedPercentage}}%)
                            </div>
                        </div>
                    </label>
                </div>
                <div class="mx-8">
                    <label>
                        <div class="flex">
                            <input class="mr-8" type="checkbox" v-model="filterRemoved">
                            <div>
                                Deleted
                                {{differ.stats[resourceName].removed}} ({{differ.stats[resourceName].removedPercentage}}%)
                            </div>
                        </div>
                    </label>
                </div>
                <div class="mx-8">
                    <label>
                        <div class="flex">
                            <input class="mr-8" type="checkbox" v-model="filterModified">
                            <div>
                                Modified
                                {{differ.stats[resourceName].modified}} ({{differ.stats[resourceName].modifiedPercentage}}%)
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <div class="flex py-12 items-center justify-end">
            <div class="ml-16" v-if="resourceName !== 'settings'">
                <button
                    @click="$root.$emit('onForceExpandAll')"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    <div>Expand all diffs</div>
                </button>
            </div>
            <div v-if="resourceName !== 'settings'">
                <button
                    @click="$root.$emit('onForceCollapseAll')"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Collapse all diffs
                </button>
            </div>
        </div>
        <object-diff :key="diff.value" :diff="diff" v-for="diff in filteredDiff" />
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
                hitsPerPage: 100,
                page: 0,
            }
        },
        watch: {
            filterAdded: function () { this.page = 0; },
            filterRemoved: function () { this.page = 0; },
            filterModified: function () { this.page = 0; },
            filterUntouched: function () { this.page = 0; },
        },
        created: function () {
            this.$root.$on('resetPage', () => this.page = 0);
        },
        computed: {
            filteredDiff: function () {
                return this.diffs.slice(this.page * this.hitsPerPage, (this.page + 1) * this.hitsPerPage);
            },
            diffs: function () {
                if (this.filterAdded && this.filterRemoved && this.filterModified && this.filterUntouched) {
                    return this.differ.diffs[this.resourceName];
                } else {
                    return this.differ.diffs[this.resourceName].filter((diff) => {
                        return (diff.added && this.filterAdded)
                            || (diff.removed && this.filterRemoved)
                            || (diff.modified && this.filterModified)
                            || (diff.untouched && this.filterUntouched);
                    });
                }
            },
        },
    }
</script>

<style
