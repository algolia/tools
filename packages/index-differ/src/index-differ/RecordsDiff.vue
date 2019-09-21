<template>
    <div class="text-telluric-blue">
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