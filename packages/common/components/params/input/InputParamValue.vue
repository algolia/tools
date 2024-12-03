<template>
  <algolia-autocomplete
    ref="algoliaautocomplete"
    :app-id="algoliaAppId"
    :api-key="algoliaApiKey"
    index-name="metaparams"
    :display-empty-query="true"
    display-attribute-name="display_name"
    :value="value"
    :search-params="{
      hitsPerPage: 8,
      filters: `type:value AND param_name:'${inputKey}'`,
    }"
    @onSelected="onSelected"
    @onBlur="onBlur"
  />
</template>

<script>
    import inputMixin from "../scripts/inputMixin";
    import AlgoliaAutocomplete from "../../autocomplete/AlgoliaAutocomplete.vue";

    export default {
        name: 'InputParamValue',
        components: {AlgoliaAutocomplete},
        mixins: [inputMixin],
        data: function () {
            return {
                algoliaAppId: process.env.VUE_APP_APP_ID || 'X20GSLY1CL',
                algoliaApiKey: process.env.VUE_APP_SEARCH_ONLY_API_KEY || '1809f3ac9bf77cb7ae2076f42d35fbd3',
            };
        },
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
