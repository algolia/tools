<template>
    <div>
        <div v-if="!isEditable" @click="makeEditable()">
            {{ displayValue || JSON.stringify(value)}}
        </div>
        <component
            :class="`param-${id}-${inputKey}`"
            v-if="isEditable"
            v-bind:is="paramValueComponents[paramSpec.value_type]"
            v-bind="$props"
            :param-spec="paramSpec"
        />
    </div>
</template>

<script>
    import InputParamName from '@/params/input/InputParamName';
    import InputParamValue from '@/params/input/InputParamValue';
    import InputInteger from '@/params/input/InputInteger';
    import InputString from '@/params/input/InputString';
    import InputFilters from '@/params/input/InputFilters';
    import InputAttribute from "@/params/input/InputAttribute";
    import paramsSpecs from 'common/params-specs';
    import inputMixin from "@/params/scripts/inputMixin";

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
                }
            }
        },
        computed: {
            isEditable: function () {
                const currentIndex = this.currentIndex === undefined ? null : this.currentIndex;

                return this.inputState.inputKey === this.inputKey
                    && this.inputState.positionKey === currentIndex;
            },
            paramSpec: function () {
                return paramsSpecs[this.inputKey] || {value_type: 'string'};
            },
        },
        methods: {
            makeEditable: function () {
                this.inputState.setInput(this.inputKey, this.currentIndex);
            }
        }
    }
</script>