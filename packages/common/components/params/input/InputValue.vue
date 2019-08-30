<template>
    <div>
        <div v-if="!isEditable && !isForwardableComponent" @click="makeEditable()" class="break-all">
            <slot name="default">
                {{ displayValue || JSON.stringify(value)}}
            </slot>
        </div>
        <component
            :class="`param-${id}-${inputKeySlug}`"
            v-if="isEditable || isForwardableComponent"
            v-bind:is="getComponent"
            v-bind="$props"
            :param-spec="paramSpec"
        />
    </div>
</template>

<script>
    import InputParamName from './InputParamName';
    import InputParamValue from './InputParamValue';
    import InputInteger from './InputInteger';
    import InputString from './InputString';
    import InputFilters from './InputFilters';
    import InputAttribute from "./InputAttribute";
    import inputMixin from "../scripts/inputMixin";
    import InputDecompoundedAttributes from "./InputDecompoundedAttributes";

    export default {
        name: 'InputValue',
        mixins: [inputMixin],
        data: function () {
            return {
                paramValueComponents: {
                    enum: InputParamValue,
                    boolean: InputParamValue,
                    integer: InputInteger,
                    enum_list: InputParamValue,
                    attributes_list: InputAttribute,
                    attribute: InputAttribute,
                    string: InputString,
                    string_list: InputString,
                    filters: InputFilters,
                    param_name: InputParamName,
                    decompounded_attributes: InputDecompoundedAttributes,
                }
            }
        },
        computed: {
            getComponent: function () {
                if (this.isForwardableComponent) {
                    return this.paramValueComponents[this.paramSpec.object_type];
                }
                return this.paramValueComponents[this.paramSpec.value_type];
            },
            isForwardableComponent: function () {
                return this.paramSpec.value_type === 'object';
            },
            isEditable: function () {
                const currentIndex = this.currentIndex === undefined ? null : this.currentIndex;

                return this.inputState.inputKey === this.inputKey
                    && this.inputState.positionKey === currentIndex;
            },
        },
        methods: {
            makeEditable: function () {
                this.inputState.setInput(this.inputKey, this.currentIndex);
            }
        }
    }
</script>