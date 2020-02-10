<template>
    <custom-select
        :value="value"
        @input="$emit('input', $event)"
        :options="options"
        class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
    >
        <template slot="icon">
            <globe-icon class="block -mt-1 mr-8 w-12 h-12"/>
        </template>
        <template v-slot:default="{option}">{{option}}</template>
    </custom-select>
</template>

<script>
    import GlobeIcon from "common/icons/globe.svg";
    import CustomSelect from "common/components/selectors/CustomSelect";

    export default {
        name: 'AnalyticsRegionSelector',
        components: {GlobeIcon, CustomSelect},
        props: ['value'],
        data: function () {
            return {
                options: ['us', 'eu'],
            };
        },
    }
</script>
