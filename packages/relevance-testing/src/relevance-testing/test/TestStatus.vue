<template>
    <div class="flex items-center justify-center h-full px-12">
        <div
            class="px-4 py-2 text-xs text-center rounded leading-none"
            :class="{
                                            'bg-proton-grey': !test.reports[runPos] || test.reports[runPos].passing === null,
                                            'bg-jupiter-6': test.reports[runPos] && test.reports[runPos].passing === true,
                                            'bg-mars-1': test.reports[runPos] &&  test.reports[runPos].passing === false,
                                            'text-white': test.reports[runPos] && test.reports[runPos].passing !== null
                                        }"
        >
            <div v-if="!test.reports[runPos] || test.reports[runPos].passing === null">
                Not runned
            </div>
            <div v-else>
                {{test.reports[runPos].nbPassing}} / {{test.reports[runPos].nbTests}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'TestStatus',
        props: ['test', 'runPos'],
    }
</script>