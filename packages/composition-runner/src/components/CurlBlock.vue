<template>
  <div class="bg-moon-grey-opacity-50 border border-proton-grey-opacity-30 rounded p-12">
    <div class="flex items-center mb-8">
      <label class="text-xs text-nova-grey flex items-center mr-auto">
        <input
          type="checkbox"
          class="mr-4"
          :checked="embedKey"
          @change="onToggleEmbed"
        >
        Embed API key in snippet
      </label>
      <button
        class="text-nebula-blue text-xs underline"
        @click="onCopy"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="text-xs text-solstice-blue whitespace-pre-wrap break-all"><code>{{ curl }}</code></pre>
  </div>
</template>

<script>
    import copy from 'copy-to-clipboard';
    import { buildCurl, parsePayload } from '../lib/runner';

    export default {
        name: 'CurlBlock',
        data() {
            return { copied: false, copyTimer: null };
        },
        computed: {
            appId() {
                return this.$store.state.compositionrunner.appId;
            },
            apiKey() {
                if (!this.appId || !this.$store.state.apps[this.appId]) return '';
                return this.$store.state.apps[this.appId].key || '';
            },
            compositionID() {
                return this.$store.state.compositionrunner.compositionId;
            },
            payloadText() {
                return this.$store.state.compositionrunner.payload;
            },
            embedKey() {
                return this.$store.state.compositionrunner.embedKey;
            },
            requestBody() {
                const parsed = parsePayload(this.payloadText);
                return parsed.ok ? parsed.value : {};
            },
            curl() {
                return buildCurl({
                    appId: this.appId,
                    apiKey: this.apiKey,
                    compositionID: this.compositionID,
                    requestBody: this.requestBody,
                    embedKey: this.embedKey,
                });
            },
        },
        beforeDestroy() {
            if (this.copyTimer) window.clearTimeout(this.copyTimer);
        },
        methods: {
            onToggleEmbed(event) {
                this.$store.commit('compositionrunner/setEmbedKey', event.target.checked);
            },
            onCopy() {
                copy(this.curl);
                this.copied = true;
                if (this.copyTimer) window.clearTimeout(this.copyTimer);
                this.copyTimer = window.setTimeout(() => { this.copied = false; }, 1500);
            },
        },
    };
</script>
