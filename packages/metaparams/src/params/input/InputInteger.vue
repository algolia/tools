<template>
    <div>
        <input
            ref="input"
            class="input"
            type="number"
            v-model.number="value"
            :min="paramSpec.min !== undefined ? paramSpec.min : ''"
            :max="paramSpec.max !== undefined ? paramSpec.max : ''"
            v-on:keydown.enter.prevent="canBlur = false"
            v-on:keydown.tab.prevent="canBlur = false"
            v-on:keyup.enter.prevent="nextInput"
            v-on:keyup.tab.prevent="nextInput"
            @blur="onBlur"
        /> <span v-if="paramSpec.default === value">(Default)</span>
    </div>
</template>

<script>
    import inputMixin from "@/params/scripts/inputMixin";

    export default {
        name: 'InputInteger',
        mixins: [inputMixin],
        props: ['paramSpec'],
    }
</script>