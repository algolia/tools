import Vue from 'vue';

const ParamsInputState = function (id) {
    this.id = id;
    this.inputKey = null;
    this.positionKey = null;

    this.setInput = function (inputKey, positionKey) {
        this.inputKey = inputKey !== undefined ? inputKey : null;
        this.positionKey = positionKey !== undefined ? positionKey : null;

        Vue.nextTick(() => {
            const input = document.querySelector(`.param-${this.id}-${this.inputKey} .input`);

            if (input) {
                input.focus();
                if (input.setSelectionRange && input.type !== 'number') {
                    input.setSelectionRange(0, input.value.length);
                }
            }
        });
    }
};

const states = {};

export default function (id) {
    if (states[id]) return states[id];

    states[id] = new ParamsInputState(id);

    return states[id];
}