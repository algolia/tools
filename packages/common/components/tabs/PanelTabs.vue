<template>
    <div class="flex border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
        <div
            v-for="option in filteredOptions"
            class="mx-8 p-8"
            :class="`${value === option.value ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
            @click="$emit('input', option.value)"
        >
            {{option.label}}<span v-if="option.labelAppendCondition">{{option.labelAppend}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'PanelTabs',
        props: ['value', 'options'],
        computed: {
            filteredOptions: function () {
                return this.options.filter((option) => option.condition === undefined || option.condition);
            }
        }
    }
</script>
