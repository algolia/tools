<template>
    <custom-select
        :value="value"
        @input="$emit('input', $event)"
        :options="Object.keys(options)"
        class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
    >
        <template v-slot:default="{option}">{{options[option]}}</template>
    </custom-select>
</template>

<script>
    import CustomSelect from "common/components/selectors/CustomSelect";

    export default {
        name: 'SignSelect',
        props: ['value'],
        data: function () {
            return {
                options: {
                    '=': '(=) equals',
                    '!=': '!= not equals',
                    '>': '(>) more than',
                    '>=': '(>=) at least',
                    '<': '(<) less than',
                    '<=': '(<=) at most',
                }
            }
        },
        components: {CustomSelect},
    }
</script>