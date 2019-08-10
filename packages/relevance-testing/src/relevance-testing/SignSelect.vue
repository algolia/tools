<template>
    <select :value="value" @input="$emit('input', $event.target.value)" class="mr-8 w-108">
        <option value="=">(=) exactly</option>
        <option value="!=">(!=) different </option>
        <option value=">">(&gt;) more than</option>
        <option value=">=">(&gt;=) at least</option>
        <option value="<">(&lt;) less than</option>
        <option value="<=">(&lt;=) at most</option>
    </select>
</template>

<script>
    export default {
        name: 'SignSelect',
        props: ['value'],
    }
</script>