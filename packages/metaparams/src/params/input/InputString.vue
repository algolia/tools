<template>
    <div>
        <input
            ref="input"
            class="input input-custom max-w-full"
            v-model="value"
            v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
            v-on:keydown.enter.prevent="canBlur = false"
            v-on:keydown.tab.prevent="canBlur = false"
            v-on:keyup.enter.prevent="nextInput"
            v-on:keyup.tab.prevent="nextInput"
            @blur="onBlur"
        />
    </div>
</template>

<script>
    import inputMixin from "@/params/scripts/inputMixin";

    export default {
        name: 'InputString',
        mixins: [inputMixin],
    }
</script>