<template>
    <custom-select
        :value="value"
        @input="$emit('input', $event)"
        :options="options"
        class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60"
    >
        <template v-slot:default="{option}">{{option}}</template>
    </custom-select>
</template>

<script>
    import CustomSelect from "common/components/selectors/CustomSelect";

    export default {
        name: 'NumberSelect',
        props: ['value', 'min', 'max'],
        computed: {
            options: function () {
                const options = [];
                for (let i = this.min; i < this.max; i++) {
                    options.push(i);
                }
                return options;
            }
        },
        components: {CustomSelect},
    }
</script>