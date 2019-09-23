<template>
    <div class="text-telluric-blue">
        <div class="flex justify-center py-12">
            <div>
                <label>
                    <input type="checkbox" v-model="filterAdded">
                    Added: {{differ.stats[resourceName].added}} ({{differ.stats[resourceName].addedPercentage}}%)
                </label>
            </div>
            <div class="ml-32">
                <label>
                    <input type="checkbox" v-model="filterRemoved">
                    Deleted: {{differ.stats[resourceName].removed}} ({{differ.stats[resourceName].removedPercentage}}%)
                </label>
            </div>
            <div class="ml-32">
                <label>
                    <input type="checkbox" v-model="filterModified">
                    Modified: {{differ.stats[resourceName].modified}} ({{differ.stats[resourceName].modifiedPercentage}}%)
                </label>
            </div>
            <div class="ml-32">
                <label>
                    <input type="checkbox" v-model="filterUntouched">
                    Untouched: {{differ.stats[resourceName].untouched}} ({{differ.stats[resourceName].untouchedPercentage}}%)
                </label>
            </div>
        </div>
        <div class="flex py-12 items-center justify-around h-56">
            <div>
                {{differ.A.ids[resourceName].length}}
                <span v-if="resourceName === 'records'">/{{differ.A.nbHits[resourceName]}}</span>
                {{resourceName}}
                <span v-if="resourceName === 'records'">loaded</span>
            </div>
            <div :class="{invisible: differ.isComplete || loading}" v-if="resourceName === 'records'">
                <button
                    @click="loadMore"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Load more records
                </button>
            </div>
            <div>
                {{differ.B.ids[resourceName].length}}
                <span v-if="resourceName === 'records'">/{{differ.B.nbHits[resourceName]}}</span>
                {{resourceName}}
                <span v-if="resourceName === 'records'">loaded</span>
            </div>
        </div>
        <object-diff :diff="diff" v-for="diff in diffs" />
    </div>
</template>

<script>
    import ObjectDiff from "@/index-differ/ObjectDiff";
    export default {
        name: 'RecordsDiff',
        components: {ObjectDiff},
        props: ['differ', 'resourceName'],
        data: function () {
            return {
                filterAdded: true,
                filterRemoved: true,
                filterModified: true,
                filterUntouched: true,
                loading: false,
            }
        },
        computed: {
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
        methods: {
            loadMore: function () {
                this.loading = true;
                if (this.resourceName === 'records') {
                    this.differ.records().then(() => {
                        this.loading = false;
                    });
                }
            }
        }
    }
</script>

<style