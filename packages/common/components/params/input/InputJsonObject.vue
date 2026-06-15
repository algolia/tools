<template>
  <div class="w-full">
    <textarea
      ref="input"
      v-model="draft"
      class="input-custom w-full max-w-full font-mono text-xs leading-tight p-8"
      rows="6"
      @focus="onFocus"
      @input="onInput"
      @keydown.tab.prevent
      @blur="onBlur"
    />
    <div
      v-if="error"
      class="text-mars-1 text-xs mt-4"
    >
      {{ error }}
    </div>
  </div>
</template>

<script>
import inputMixin from "../scripts/inputMixin";

export default {
    name: 'InputJsonObject',
    mixins: [inputMixin],
    data: function () {
        return {
            draft: JSON.stringify(this.value || {}, null, 2),
            error: '',
            isEditing: false,
        };
    },
    watch: {
        value: function (value) {
            if (this.isEditing) return;
            const serialized = JSON.stringify(value || {}, null, 2);
            if (serialized !== this.draft) {
                this.draft = serialized;
            }
        },
    },
    mounted: function () {
        if (this.$refs.input) {
            this.$refs.input.focus();
            this.$refs.input.setSelectionRange(0, this.draft.length);
        }
    },
    methods: {
        parseDraft: function () {
            try {
                const parsed = JSON.parse(this.draft);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    this.error = 'Expected a JSON object.';
                    return null;
                }
                this.error = '';
                return parsed;
            } catch (e) {
                this.error = e.message;
                return null;
            }
        },
        onFocus: function () {
            this.isEditing = true;
        },
        onInput: function () {
            this.isEditing = true;
            const parsed = this.parseDraft();
            if (parsed) {
                this.value = parsed;
            }
        },
        onBlur: function () {
            this.isEditing = false;
            const parsed = this.parseDraft();
            if (parsed) {
                this.value = parsed;
                this.inputState.setInput('none');
            }
        },
    },
}
</script>
