<template>
    <div :class="`param-${id}-root`">
        <div v-if="!isEditable" @click="inputState.setInput('root')">
            <button
                v-if="inputKey === 'root'"
                class="bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
            >
                {{ displayValue }}
            </button>
            <div v-if="inputKey !== 'root'">{{ JSON.stringify(inputKey) }}:&nbsp;</div>
        </div>
        <algolia-autocomplete
            v-if="isEditable"
            app-id="AJ0P3S7DWQ"
            api-key="90dfaaf5755e694f341fe68f6e41a6d4"
            index-name="metaparams"
            @onSelected="onSelected"
            @onBlur="inputState.setInput('none')"
            :display-empty-query="inputKey !== 'root'"
            display-attribute-name="camel_case_label"
            :search-params="{hitsPerPage: 4, ...searchFilters}"
        />
    </div>

</template>

<script>
    import AlgoliaAutocomplete from "../../autocomplete/AlgoliaAutocomplete";
    import paramsSpecs from '../../../params-specs';
    import inputMixin from "../scripts/inputMixin";

    const isObject = function (obj) {
        return obj && typeof obj === 'object' && obj.constructor === Object;
    };

    export default {
        name: 'InputParamName',
        components: {AlgoliaAutocomplete},
        mixins: [inputMixin],
        props: ['id', 'configKey', 'inputKey', 'displayValue', 'setParamValue'],
        computed: {
            isEditable: function () {
                return this.inputState.inputKey === this.inputKey;
            },
            searchFilters: function () {
                if (this.configKey.startsWith('searchParams')) {
                    return {filters: 'scope:search'}
                }
                return {filters: 'scope:settings'}
            },
        },
        methods: {
            onSelected: function (selected, e) {
                if (selected) {
                    if ((typeof selected === 'string' || selected instanceof String) && selected.trim().startsWith('{')) {
                        try {
                            const params = JSON.parse(selected);
                            Object.keys(params).map((key) => {
                                this.setParamValue(key, params[key]);
                            });
                            return this.inputState.setInput('none');
                            // eslint-disable-next-line
                        } catch (e) {}
                    }

                    if (selected.type === 'value') {
                        if (['enum', 'boolean'].indexOf(selected.value_type) !== -1) {
                            return this.setParamValue(selected.param_name, selected.name);
                        }
                        if (selected.value_type === 'enum_list') {
                            this.setParamValue(selected.param_name, [selected.name, '']);
                            return this.inputState.setInput(selected.param_name, 1);
                        }
                        if (selected.value_type === 'object') {
                            let defaultValue = JSON.parse(JSON.stringify(paramsSpecs[selected.param_name].default));
                            let positionKey = null;
                            if (Object.hasOwn(paramsSpecs, selected.name)) {
                                defaultValue[selected.name] = paramsSpecs[selected.name].default;
                                positionKey = `${selected.name}-value`;
                            }
                            this.setParamValue(selected.param_name, defaultValue);
                            return this.inputState.setInput(selected.param_name, positionKey);
                        }
                    } else if (selected.value_type === 'integer') {
                        this.setParamValue(selected.name, selected.default);
                        return this.inputState.setInput(selected.name);
                    } else if (selected.type === 'param') {
                        let defaultValue = JSON.parse(JSON.stringify(paramsSpecs[selected.param_name].default));

                        if (Array.isArray(defaultValue)) {
                            defaultValue.push('');
                            this.setParamValue(selected.param_name, defaultValue);
                            return this.inputState.setInput(selected.param_name, defaultValue.length - 1);
                        } else if (isObject(defaultValue)) {
                            this.setParamValue(selected.param_name, defaultValue);
                            return this.inputState.setInput(selected.param_name);
                        } else {
                            this.setParamValue(selected.param_name, defaultValue);
                            return this.inputState.setInput(selected.param_name);
                        }
                    }
                    else {
                        this.setParamValue(selected, '');
                        return this.inputState.setInput(selected);
                    }
                }

                return this.nextInput(e);
            },
        }
    }
</script>
