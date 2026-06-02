<template>
  <div class="w-full max-w-full">
    <div class="flex items-center gap-4">
      <span class="text-xs text-proton-grey whitespace-nowrap">workflowSelector.name</span>
      <input
        ref="workflowNameInput"
        v-model="workflowName"
        class="input-custom min-w-0 flex-1 text-xs p-4"
        placeholder="your_workflow_name"
        @keydown.enter.prevent="inputState.setInput('none')"
        @blur="onBlur"
      >
      <button
        type="button"
        class="bg-white border border-proton-grey-opacity-40 rounded px-8 p-4 text-xs shadow-sm hover:shadow transition-fast-out"
        @click="toggleJsonMode"
      >
        {{ showJson ? 'Form' : 'JSON' }}
      </button>
    </div>
    <div
      v-if="showJson"
      class="mt-4"
    >
      <textarea
        v-model="draft"
        class="input-custom w-full max-w-full font-mono text-xs leading-tight p-8"
        rows="6"
        @input="onJsonInput"
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
  </div>
</template>

<script>
import inputMixin from "../scripts/inputMixin";

const defaultExtensions = function () {
    return {
        workflowSelector: {
            name: '',
        },
    };
};

const extensionsValue = function (value) {
    return value || defaultExtensions();
};

const setWorkflowName = function (value, name) {
    return {
        ...(value || {}),
        workflowSelector: {
            ...((value || {}).workflowSelector || {}),
            name,
        },
    };
};

export default {
    name: 'InputExtensions',
    mixins: [inputMixin],
    data: function () {
        return {
            draft: JSON.stringify(extensionsValue(this.value), null, 2),
            error: '',
            showJson: false,
        };
    },
    computed: {
        workflowName: {
            get: function () {
                return ((this.value || {}).workflowSelector || {}).name || '';
            },
            set: function (name) {
                const nextValue = setWorkflowName(this.value, name);
                this.value = nextValue;
                this.draft = JSON.stringify(nextValue, null, 2);
                this.error = '';
            },
        },
    },
    watch: {
        value: function (value) {
            if (this.showJson) return;
            const serialized = JSON.stringify(extensionsValue(value), null, 2);
            if (serialized !== this.draft) {
                this.draft = serialized;
            }
        },
    },
    mounted: function () {
        if (this.$refs.workflowNameInput) {
            this.$refs.workflowNameInput.focus();
            this.$refs.workflowNameInput.select();
        }
    },
    methods: {
        toggleJsonMode: function () {
            this.showJson = !this.showJson;
            if (this.showJson) {
                this.draft = JSON.stringify(extensionsValue(this.value), null, 2);
            }
        },
        onJsonInput: function () {
            try {
                const parsed = JSON.parse(this.draft);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    this.error = 'Expected a JSON object.';
                    return;
                }
                this.error = '';
                this.value = parsed;
            } catch (e) {
                this.error = e.message;
            }
        },
    },
}
</script>
