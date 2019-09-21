<template>
    <div class="text-telluric-blue">
        <div class="flex justify-center py-12">
            <div>
                Added: {{differ.stats.added}} ({{differ.stats.addedPercentage}}%)
            </div>
            <div class="ml-32">
                Deleted: {{differ.stats.removed}} ({{differ.stats.removedPercentage}}%)
            </div>
            <div class="ml-32">
                Modified: {{differ.stats.modified}} ({{differ.stats.modifiedPercentage}}%)
            </div>
            <div class="ml-32">
                Untouched: {{differ.stats.untouched}} ({{differ.stats.untouchedPercentage}}%)
            </div>
        </div>
        <record-diff :diff="diff" v-for="diff in differ.recordsDiff" />
    </div>
</template>

<script>
    import RecordDiff from "@/index-differ/RecordDiff";
    export default {
        name: 'RecordsDiff',
        components: {RecordDiff},
        props: ['differ'],
    }
</script>

<style