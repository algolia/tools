<template>
    <select :value="value" @input="$emit('input', $event.target.value)" class="mr-8">
        <option value="=">=</option>
        <option value="!=">!=</option>
        <option value=">">&gt;</option>
        <option value=">=">&gt;=</option>
        <option value="<">&lt;</option>
        <option value="<=">&lt;=</option>
    </select>
</template>

<script>
    export default {
        name: 'SignSelect',
        props: ['value'],
    }
</script>