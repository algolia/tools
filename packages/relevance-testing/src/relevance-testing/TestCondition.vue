<template>
    <div>
        - have {{condition.type}} {{condition.key}}{{condition.operator}}{{condition.value}}
    </div>
</template>

<script>
    export default {
        name: 'TestCondition',
        props: ['condition'],
    }
</script>