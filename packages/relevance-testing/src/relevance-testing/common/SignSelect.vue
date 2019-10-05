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
        props: ['value', 'numericOnly'],
        data: function () {
            return {
                stringOptions: {
                    'is': 'is',
                    'isNot': 'is not',
                    'contains': 'contains',
                    'notContains': 'doesn\'t contains',
                },
                numericOptions: {
                    '=': '(=) equals',
                    '!=': '!= not equals',
                    '>': '(>) more than',
                    '>=': '(>=) at least',
                    '<': '(<) less than',
                    '<=': '(<=) at most',
                },
                otherOptions: {
                    'isTrue': 'is true',
                    'isFalse': 'is false',
                    'isNull': 'is null',
                }
            }
        },
        computed: {
            options: function () {
                if (this.numericOnly) {
                    return this.numericOptions;
                }
                return {
                    ...this.stringOptions,
                    ...this.numericOptions,
                    ...this.otherOptions,
                }
            }
        },
        components: {CustomSelect},
    }
</script>
