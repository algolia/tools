<template>
    <div>
        <div v-for="(v, k) in value" :key="k" class="flex hover:bg-proton-grey-opacity-40 pl-12">
            <div class="flex flex-wrap w-full" style="max-width: calc(100% - 51px)">
                <input-param-value
                    v-bind="$props"
                    v-if="inputState.positionKey === k"
                    :get-value="k"
                    :set-value="setFlag"
                    :param-spec="getFlagSpec(k)"
                    :prevent-next-input="true"
                    :custom-on-blur="onBlur"
                />
                <div v-else @click="inputState.setInput(inputKey, k)" class="truncate max-w-full" style="max-width: calc(100% - 20px)">
                    {{JSON.stringify(k)}}
                </div>
                <div class="ml-1">: </div>
                <div :class="getStatusClasses(v)">
                    <component
                        v-if="inputState.inputKey === inputKey && inputState.positionKey === `${k}-value`"
                        v-bind="$props"
                        v-bind:is="getFlagComponent(k)"
                        class="ml-4 max-w-full cursor-pointer"
                        :class="`param-${id}-${inputKeySlug}`"
                        :get-value="v || getFlagSpec(k).default"
                        :set-value="setFlagValue(k)"
                        :param-spec="getFlagSpec(k)"
                        :custom-on-blur="onBlur"
                        :input-key="k"
                    />
                    <div
                        v-else
                        class="ml-4 max-w-full cursor-pointer break-all"
                        @click="inputState.setInput(inputKey, `${k}-value`)"
                    >
                        {{ JSON.stringify(v) }}
                    </div>
                </div>
            </div>
            <div class="ml-auto justify-end flex invisible group-hover:visible">
                <trash-icon
                    v-if="status !== 'deleted'"
                    @click="deleteFlag(k)"
                    class="w-12 h-12 ml-auto cursor-pointer invisible group-hover:visible"
                />
            </div>
        </div>
        <div class="pl-12">
            <input-param-value
                v-bind="$props"
                :get-value="null"
                :set-value="setFlag"
                :param-spec="paramSpec"
                :prevent-next-input="true"
                :custom-on-blur="onBlur"
                v-if="inputState.inputKey === inputKey && inputState.positionKey === null"
            />
        </div>
        <button
            @click="addFlag"
            class="ml-12 bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-8 p-4 text-sm mt-4"
        >
            +
        </button>
    </div>
</template>

<script>
import InputParamValue from "./InputParamValue.vue";
import InputInteger from "./InputInteger.vue";
import TrashIcon from "../../../icons/trash.svg"
import InputString from "./InputString.vue";
import inputMixin from "../scripts/inputMixin";
import paramsSpecs from '../../../params-specs';


export default {
    name: 'InputDevFeatureFlags',
    mixins: [inputMixin],
    components: {InputParamValue, InputInteger, InputString, TrashIcon},
    data: function () {
      return {
          flagComponents: {
              boolean: InputParamValue,
              integer: InputInteger,
              string: InputString,
          }
      }
    },
    methods: {
        getFlagComponent: function (flag) {
            return this.flagComponents[paramsSpecs[flag].value_type];
        },
        onBlur: function () {
            this.$nextTick(() => {
                this.inputState.setInput('none');
            });
        },
        deleteFlag: function (flag) {
            const obj = JSON.parse(JSON.stringify(this.value));
            delete(obj[flag]);
            this.setParamValue(this.inputKey, obj);
            this.inputState.setInput('none');
        },
        setFlag: function (flag, oldFlag) {
            const obj = JSON.parse(JSON.stringify(this.value));
            if (flag !== oldFlag && !obj[flag]) {
                obj[flag] = obj[oldFlag];
                delete(obj[oldFlag]);
            }
            obj[flag] = JSON.parse(JSON.stringify(paramsSpecs[flag].default));
            this.setParamValue(this.inputKey, obj);
            this.inputState.setInput(this.inputKey, `${flag}-value`);
        },
        addFlag: function () {
            this.inputState.setInput(this.inputKey, null);
        },
        setFlagValue: function (flag) {
            return (val) => {
                const obj = JSON.parse(JSON.stringify(this.value));
                obj[flag] = val;
                this.setParamValue(this.inputKey, obj);
            }
        },
        getFlagSpec: function (flag) {
            return paramsSpecs[flag];
        },
        getStatusClasses: function (val) {
            if (!this.statusClasses || this.statusClasses.length === 0) {
                return ['number', 'boolean'].indexOf(typeof val) === -1 ? 'text-cosmos-black-opacity-70' : 'text-neptune-1';
            }
            return this.statusClasses;
        }
    }
}
</script>
