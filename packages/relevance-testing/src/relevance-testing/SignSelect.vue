<template>
    <select :value="value" @input="$emit('input', $event.target.value)" class="mr-8">
        <option value="=">(=) exactly</option>
        <option value="!=">(!=) not be equal to </option>
        <option value=">">(&gt;) more than</option>
        <option value=">=">(&gt;=) at least</option>
        <option value="<">(&lt;) less than</option>
        <option value="<=">(&lt;=) maximum</option>
    </select>
</template>

<script>
    export default {
        name: 'SignSelect',
        props: ['value'],
    }
</script>