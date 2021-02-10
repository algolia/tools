<template>
    <div
        v-if="suite.reports[runPosition]"
        class="p-8 text-telluric-blue text-xs text-center"
    >
        <div>{{suite.reports[runPosition].nbPassing}} / {{suite.reports[runPosition].nbTests}}</div>
    </div>
</template>

<script>
    export default {
        name: 'StatusRun',
        props: ['suite', 'run', 'runPosition'],
    }
</script>