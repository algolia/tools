<template>
    <algolia-autocomplete
        ref="algoliaautocomplete"
        @onSelected="onSelected"
        @onBlur="onBlur"
        app-id="AJ0P3S7DWQ"
        api-key="90dfaaf5755e694f341fe68f6e41a6d4"
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
    import inputMixin from "../scripts/inputMixin";
    import AlgoliaAutocomplete from "../../autocomplete/AlgoliaAutocomplete.vue";

    export default {
        name: 'InputParamValue',
        components: {AlgoliaAutocomplete},
        mixins: [inputMixin],
        methods: {
            onBlur: function () {
                if (this.customOnBlur) return this.customOnBlur();
                this.removeEmptyElementInArray();
                this.inputState.setInput('none');
            },
            onSelected(value, e) {
                if (value.name !== undefined) {
                    this.value = value.name;
                } else {
                    this.value = value;
                }
                if (this.preventNextInput) return;
                this.nextInput(e);
            }
        }
    }
</script>
