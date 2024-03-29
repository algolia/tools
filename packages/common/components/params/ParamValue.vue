<template>
    <div class="group" :class="statusClasses">
        <div class="flex hover:bg-proton-grey-opacity-40 p-1">
            <div class="flex flex-wrap w-full" style="max-width: calc(100% - 51px)">
                <div class="truncate max-w-full" style="max-width: calc(100% - 20px)">
                    "{{ inputKey }}
                </div>
                <div>"</div>
                <div class="ml-1">:</div>
                <div class="ml-4" v-if="Array.isArray(param.value)">[</div>
                <div class="ml-4" v-if="isObject(param.value)">{</div>
                <input-value
                    class="ml-4 max-w-full cursor-pointer"
                    v-bind="$props"
                    :value="param.value"
                    :param-spec="paramSpec"
                    :status-classes="statusClasses"
                    v-if="!Array.isArray(param.value) && !isObject(param.value)"
                />
            </div>
            <div class="ml-auto justify-end flex invisible group-hover:visible">
                <input v-model="enabled" v-if="panelKey && configKey !== 'indexSettings'" type="checkbox" class="ml-4"/>
                <div v-if="panelKey && status !== 'deleted' && paramCamJump"
                     class="ml-4"
                     @click="$store.commit('panels/jumpParamValue', {panelKey, configKey, inputKey})"
                >
                    <flip-right-icon v-if="panelKey === 'leftPanel'" class="w-12 h-12 fill-current cursor-pointer" />
                    <flip-left-icon v-else class="w-12 h-12 fill-current cursor-pointer" />
                </div>
                <history-icon
                    v-if="status !== 'same' && status !== 'added' && configKey === 'indexSettings'"
                    @click="restoreKey(inputKey)"
                    class="ml-4 w-12 h-12 cursor-pointer fill-current"
                />
                <trash-icon
                    v-if="status !== 'deleted'" @click="deleteKey(inputKey)"
                    class="ml-4 w-12 h-12 cursor-pointer"
                />
            </div>
        </div>
        <div class="pl-4">
            <div v-if="isObject(param.value)">
                <input-value
                    :value="param.value"
                    :param-spec="paramSpec"
                    :status="status"
                    :status-classes="statusClasses"
                    v-bind="$props"
                    class="break-words cursor-pointer"
                />
            </div>
            <div
                v-if="Array.isArray(param.value)"
                class="pl-12" :class="statusClasses.length === 0 ? 'text-cosmos-black-opacity-70' : statusClasses"
            >
                <div class="cursor-pointer" v-if="collapseBigArrays && param.value.length > 10" @click="collapseBigArrays = false">
                    ... <span class="text-proton-grey">({{param.value.length}} values)</span>
                </div>
                <draggable v-model="param.value" v-else class="flex" :disabled="status === 'deleted'">
                    <transition-group class="w-full">
                        <div
                            v-for="(v, index) in param.value" :key="index - 1"
                            class="relative flex group w-full hover:bg-proton-grey-opacity-40 p-1"
                        >
                            <input-value
                                :value="param.value[index]"
                                :param-spec="paramSpec"
                                v-bind="$props"
                                class="break-words cursor-pointer"
                                style="max-width: calc(100% - 16px)"
                                :current-index="index"
                            />
                            <trash-icon
                                v-if="status !== 'deleted'"
                                @click="deleteArrayElement(inputKey, index)"
                                class="w-12 h-12 ml-auto cursor-pointer invisible group-hover:visible"
                            />
                        </div>
                    </transition-group>
                </draggable>
                <button
                    v-if="status !== 'deleted'"
                    @click="addArrayElement(inputKey)"
                    class="bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-8 p-4 text-sm mt-4"
                >
                    +
                </button>
            </div>
            <div v-if="Array.isArray(param.value)">]</div>
            <div v-if="isObject(param.value)">}</div>
        </div>
    </div>
</template>

<script>
    import draggable from 'vuedraggable'
    import InputValue from "./input/InputValue";
    import paramsSpecs from '../../params-specs';

    import TrashIcon from "../../icons/trash.svg"
    import FlipLeftIcon from "../../icons/flip-left.svg";
    import FlipRightIcon from "../../icons/flip-right.svg";
    import HistoryIcon from "../../icons/history.svg";

    const isObject = function (obj) {
        return obj && typeof obj === 'object' && obj.constructor === Object;
    };

    export default {
        name: 'ParamValue',
        components: {InputValue, draggable, TrashIcon, FlipLeftIcon, FlipRightIcon, HistoryIcon},
        props: [
            'id', 'inputKey', 'param', 'isLastElement', 'configKey',
            'setParamValue', 'addArrayElement', 'deleteArrayElement', 'deleteKey', 'restoreKey',
            'refParam', 'rawParam', 'keysIndexer',
            'panelKey', 'setParamEnabled'
        ],
        data: function () {
            return {
                values: [],
                collapseBigArrays: true,
                isObject,
            }
        },
        computed: {
            enabled: {
                get() {
                    return this.param.enabled;
                },
                set(value) {
                    this.setParamEnabled(this.inputKey, value);
                }
            },
            paramSpec: function () {
                return paramsSpecs[this.inputKey] || {value_type: 'string'};
            },
            paramCamJump: function () {
                return this.$store.state.panels.splitMode && (this.configKey !== 'indexSettings' || !this.sameIndexOnEachPanel);
            },
            status: function () {
                if (this.configKey !== 'indexSettings') return (this.refParam.enabled ? 'same' : 'disabled');
                if (this.refParam !== undefined && this.rawParam !== undefined) {
                    if (JSON.stringify(this.refParam.value) === JSON.stringify(this.rawParam.value)) {
                        return 'same';
                    } else {
                        return 'modified';
                    }
                }
                if (this.refParam === undefined && this.rawParam !== undefined) return 'added';
                if (this.refParam !== undefined && this.rawParam === undefined) return 'deleted';

                return 'same';
            },
            statusClasses: function () {
                const statusClass = {
                    same: '',
                    added: 'text-jupiter-1',
                    modified: 'text-saturn-1',
                    disabled: 'line-through',
                    deleted: 'line-through text-mars-1',
                };

                return statusClass[this.status];
            },
        },
    }
</script>
