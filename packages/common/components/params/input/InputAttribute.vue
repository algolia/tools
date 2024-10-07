<template>
    <autocomplete
        ref="autocomplete"
        :items="items"
        :refine="refine"
        :value="value"
        :display-empty-query="true"
        :empty-search-for-query-equals-value="true"
        @onSelected="onSelected"
        @onBlur="onBlur"
    >
        <template v-slot:item="{ index, item }">
            <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
            <div v-html="highlightStringBaseOnQuery(escapeHtml(item), query)"></div>
        </template>
    </autocomplete>
</template>

<script>
    import Autocomplete from "../../autocomplete/Autocomplete.vue";
    import inputMixin from "../scripts/inputMixin";
    import {escapeHtml, highlightStringBaseOnQuery} from "common/utils/formatters";

    export default {
        name: 'InputAttribute',
        components: {Autocomplete},
        mixins: [inputMixin],
        props: ['paramSpec'],
        data: function () {
            return {
                items: [],
                extraAttrs: this.paramSpec.values || [],
                query: '',
            }
        },
        watch: {
            keysIndexer: function () {
                this.refine(this.value);
            }
        },
        methods: {
            onBlur: function () {
                if (this.customOnBlur) return this.customOnBlur();
                this.removeEmptyElementInArray();
                this.inputState.setInput('none');
            },
            onSelected(value, e) {
                if (value !== null) this.value = value;
                this.nextInput(e);
            },
            refine: function (query) {
                this.query = query;
                if (this.keysIndexer) {
                    let items = this.keysIndexer.search(query, 4, this.extraAttrs);
                    if (this.paramSpec.modifiers) {
                       const newItems = [];

                       items.forEach((item) => {
                           this.paramSpec.modifiers.forEach((modifier) => {
                               let attribute = item;
                               if (modifier.length > 0) {
                                    attribute = `${modifier}(${attribute})`;
                               }
                               newItems.push(attribute);
                           });
                       });

                       items = newItems;
                    }

                    this.extraAttrs.forEach((extraAttr) => {
                        if (extraAttr.includes(query)) {
                            items.push(extraAttr);
                        }
                    });

                    this.items = items;
                }
            },
            escapeHtml,
            highlightStringBaseOnQuery,
        }
    }
</script>
