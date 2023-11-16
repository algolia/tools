import paramsInputState from "./paramsInputState";

const isObject = function (obj) {
    return obj && typeof obj === 'object' && obj.constructor === Object;
};

export default {
    props: [
        'id', 'param', 'configKey', 'inputKey', 'currentIndex', 'displayValue',
        'setInput', 'setParamValue', 'addArrayElement', 'deleteArrayElement', 'deleteKey', 'restoreKey',
        'keysIndexer', 'getValue', 'setValue', 'paramSpec', 'status', 'preventNextInput', 'customOnBlur',
        'statusClasses'
    ],
    data: function () {
        return {
            canBlur: false,
            inputState: paramsInputState(this.id),
        }
    },
    mounted: function () {
        this.$nextTick(() => {
            this.canBlur = true;
        });
    },
    computed: {
        inputKeySlug: function () {
            return this.inputKey.replace(/=/g, '');
        },
        value: {
            get () {
                if (this.getValue !== undefined) return this.getValue;
                if (Array.isArray(this.param.value)) {
                    return this.param.value[this.currentIndex];
                }
                return this.param.value;
            },
            set (value) {
                console.log('set value', this.setValue)
                if (this.setValue !== undefined) return this.setValue(value, this.value);
                let newVal = value;
                if (Array.isArray(this.param.value)) {
                    newVal = this.param.value;
                    newVal[this.currentIndex] = value;
                }
                this.setParamValue(this.inputKey, newVal);
            }
        }
    },
    methods: {
        onBlur: function () {
            console.log('onBlur', this.canBlur)
            if (this.canBlur) {
                this.removeEmptyElementInArray();
                this.inputState.setInput('none');
            }
        },
        prevInput: function () {
            if (this.inputState.inputKey === 'none') return;

            if (this.param && Array.isArray(this.param.value)) {
                let index = this.currentIndex;
                if (this.param.value[index].length === 0) {
                    this.deleteArrayElement(this.inputState.inputKey, index);
                }
            }

            if (this.param && isObject(this.param.value)) {
                this.removeEmptyElementInObject();
            }

            return this.inputState.setInput('none');
        },
        nextInput: function (e) {
            console.log("nextInput", this.inputState.inputKey, this.inputKey)
            if (e && e.keyCode === 9 && e.shiftKey) return this.prevInput(e); // Shift tab = reverse

            if (this.inputState.inputKey === 'none') return;
            if (this.inputState.inputKey === 'root') return this.inputState.setInput('none');

            if (Array.isArray(this.param.value)) {
                let index = this.currentIndex;
                if (!this.param.value[index] || this.param.value[index].length === 0) {
                    this.deleteArrayElement(this.inputState.inputKey, index);
                } else {
                    return this.addArrayElement(this.inputState.inputKey);
                }
            }

            if (isObject(this.param.value)) {
                if (this.inputState.inputKey === this.inputKey) {
                    return;
                }
                return this.inputState.setInput(this.inputState.inputKey, null);
            }

            return this.inputState.setInput('root');
        },
        removeEmptyElementInArray: function () {
            if (Array.isArray(this.param.value)) {
                this.param.value.forEach((elt, i) => {
                    if (!elt || elt.length === 0) {
                        this.deleteArrayElement(this.inputState.inputKey, i);
                    }
                })
            }
        },
        removeEmptyElementInObject: function () {
            this.deleteArrayElement(this.inputState.inputKey, '');
        }
    }
}
