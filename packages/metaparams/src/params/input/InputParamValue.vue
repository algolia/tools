<template>
    <algolia-autocomplete
        ref="algoliaautocomplete"
        @onSelected="onSelected"
        @onBlur="removeEmptyElementInArray(); inputState.setInput('none')"
        :app-id="algoliaAppID"
        :api-key="algoliaApiKey"
        index-name="metaparams"
        :display-empty-query="true"
        display-attribute-name="display_name"
        :value="value"
        :search-params="{
            hitsPerPage: 8,
            filters: `type:value AND param_name:'${inputKey}'`,
        }"
    />
</template>

<script>
    import inputMixin from "@/params/scripts/inputMixin";
    import AlgoliaAutocomplete from "@/autocomplete/AlgoliaAutocomplete";

    export default {
        name: 'InputParamValue',
        components: {AlgoliaAutocomplete},
        mixins: [inputMixin],
        methods: {
            onSelected(value, e) {
                if (value.name !== undefined) {
                    this.value = value.name;
                } else {
                    this.value = value;
                }
                this.nextInput(e);
            }
        }
    }
</script>