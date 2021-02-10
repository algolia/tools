<template>
    <div>
        <vue-slider
            class="ml-auto"
            :width="200"
            tooltip="always"
            v-model.number="value"
            :min="paramSpec.min !== undefined ? paramSpec.min : ''"
            :max="paramSpec.max !== undefined ? paramSpec.max : ''"
            :lazy="true"
            @dragging="updateValue($event)"
            @drag-end="onBlur"
        />
    </div>
</template>

<script>
    import VueSlider from 'vue-slider-component';
    import 'vue-slider-component/theme/default.css';
    import inputMixin from "../scripts/inputMixin";

    export default {
        name: 'InputIntegerSlider',
        mixins: [inputMixin],
        components: {VueSlider},
        props: ['paramSpec'],
        data: function () {
            return {
                timeout: null,
            }
        },
        methods: {
            updateValue: function (newValue) {
                this.timeout = clearTimeout(this.timeout);
                this.timeout = window.setTimeout(() => {
                    this.value = newValue;
                }, 5);
            }
        }
    }
</script>
