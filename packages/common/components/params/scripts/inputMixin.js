import paramsInputState from "./paramsInputState";

export default {
    props: [
        'id', 'param', 'configKey', 'inputKey', 'currentIndex', 'displayValue',
        'setInput', 'setParamValue', 'addArrayElement', 'deleteArrayElement', 'deleteKey', 'restoreKey',
        'keysIndexer',
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
            return this.inputKey.replace(/\W/g, '');
        },
        value: {
            get () {
                if (Array.isArray(this.param.value)) {
                    return this.param.value[this.currentIndex];
                }
                return this.param.value;
            },
            set (value) {
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
            if (this.canBlur) {
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

            return this.inputState.setInput('none');
        },
        nextInput: function (e) {
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
        }
    }
}