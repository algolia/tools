<template>
    <div class="flex w-full text-nova-grey bg-moon-grey-opacity-50 border-b border-proton-grey-opacity-20 px-16 py-8">
        <div class="mr-8">
            Untouched
            {{differ.stats[resourceName].untouched}} ({{differ.stats[resourceName].untouchedPercentage}}%)
        </div>
        <div class="mx-8">
            Added
            {{differ.stats[resourceName].added}} ({{differ.stats[resourceName].addedPercentage}}%)
        </div>
        <div class="mx-8">
            Deleted
            {{differ.stats[resourceName].removed}} ({{differ.stats[resourceName].removedPercentage}}%)
        </div>
        <div class="mx-8">
            Modified
            {{differ.stats[resourceName].modified}} ({{differ.stats[resourceName].modifiedPercentage}}%)
        </div>
    </div>
</template>

<script>
    export default {
        name: 'IndexStats',
        props: ['differ', 'resourceName'],
    }
</script>
