<template>
    <div>
        <hit
            v-for="(hit, index) in hits"
            :key="hit.objectID"
            :hit="hit"
            display-mode="list"
            :hit-number="index + 1"
            :top-attributes="[]"
        />
    </div>
</template>

<script>
    import Hit from 'common/components/hits/Hit';
    // 'algoliaResponse', 'panelKey', 'topAttributes', 'hit', 'previousHit', 'hitPosition', 'displayMode', 'recordCanJump', 'titleAttribute'
    export default {
        name: 'Hits',
        props: ['hits'],
        components: {Hit}
    }
</script>