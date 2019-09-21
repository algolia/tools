<template>
    <div class="text-telluric-blue">
        <div class="flex justify-center py-12">
            <div>
                <label>
                    <input type="checkbox" v-model="filterAdded">
                    Added: {{differ.stats.added}} ({{differ.stats.addedPercentage}}%)
                </label>
            </div>
            <div class="ml-32">
                <label>
                    <input type="checkbox" v-model="filterRemoved">
                    Deleted: {{differ.stats.removed}} ({{differ.stats.removedPercentage}}%)
                </label>
            </div>
            <div class="ml-32">
                <label>
                    <input type="checkbox" v-model="filterModified">
                    Modified: {{differ.stats.modified}} ({{differ.stats.modifiedPercentage}}%)
                </label>
            </div>
            <div class="ml-32">
                <label>
                    <input type="checkbox" v-model="filterUntouched">
                    Untouched: {{differ.stats.untouched}} ({{differ.stats.untouchedPercentage}}%)
                </label>
            </div>
        </div>
        <div class="flex py-12 items-center justify-around h-56">
            <div class="">{{differ.A.objectIDs.length}}/{{differ.A.nbHits}} records loaded</div>
            <div :class="{invisible: differ.isComplete || loading}">
                <button
                    @click="loadMore"
                    class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                >
                    Load more records
                </button>
            </div>
            <div class="">{{differ.A.objectIDs.length}}/{{differ.B.nbHits}} records loaded</div>
        </div>
        <record-diff :diff="diff" v-for="diff in diffs" />
    </div>
</template>

<script>
    import RecordDiff from "@/index-differ/RecordDiff";
    export default {
        name: 'RecordsDiff',
        components: {RecordDiff},
        props: ['differ'],
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
                    return this.differ.recordsDiff;
                } else {
                    return this.differ.recordsDiff.filter((diff) => {
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
                this.differ.records().then(() => {
                    this.loading = false;
                });
            }
        }
    }
</script>

<style