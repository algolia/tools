<template>
    <div v-if="group.reports[runPos]" class="p-8 text-telluric-blue text-xs text-center">
        <!--<badge class="mr-16" :passing="group.reports[i].passing" />-->
        {{group.reports[runPos].nbPassing}} / {{group.reports[runPos].nbTests}}
    </div>
</template>

<script>
    export default {
        name: 'GroupStatus',
        props: ['group', 'runPos'],
    }
</script>