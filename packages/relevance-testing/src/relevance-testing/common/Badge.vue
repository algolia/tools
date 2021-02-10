<template>
    <div>
        <div class="px-4 py-2 text-xs rounded leading-none bg-proton-grey" v-if="passing === null">
            Not runned
        </div>
        <div class="px-4 py-2 text-xs rounded leading-none bg-jupiter-6 text-white" v-if="passing === true">
            OK
        </div>
        <div class="px-4 py-2 text-xs rounded leading-none bg-mars-1 text-white" v-if="passing === false">
            KO
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Badge',
        props: ['passing'],
    }
</script>