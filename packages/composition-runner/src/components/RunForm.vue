<template>
  <div class="bg-white border border-proton-grey-opacity-60 rounded p-24">
    <div class="mb-24">
      <h2 class="text-telluric-blue text-xl font-bold">
        Run a query
      </h2>
      <p class="text-nova-grey text-base mt-4">
        Send a run request to a deployed composition and view its result sets.
      </p>
    </div>

    <div
      class="grid mb-24"
      style="grid-template-columns: 1fr 1fr; column-gap: 64px;"
    >
      <div>
        <label class="block text-telluric-blue text-sm uppercase tracking-wide mb-4">
          App ID
        </label>
        <app-selector
          v-if="hasApps"
          v-model="selectedAppId"
        />
        <p
          v-else
          class="text-sm text-nova-grey mt-4"
        >
          No apps configured — add one via the
          <button
            class="text-nebula-blue underline"
            @click="openAppsPanel"
          >
            AppIDs button
          </button>
          in the top bar.
        </p>
        <p
          v-if="selectedAppId && !apiKey"
          class="text-sm text-mars-1 mt-4"
        >
          No API key set for this app —
          <button
            class="text-nebula-blue underline"
            @click="openAppsPanel"
          >
            add it here
          </button>.
        </p>
      </div>

      <div>
        <label class="block text-telluric-blue text-sm uppercase tracking-wide mb-4">
          Composition ID
        </label>
        <composition-selector
          v-if="selectedAppId && apiKey"
          v-model="selectedCompositionId"
          :app-id="selectedAppId"
        />
        <p
          v-else
          class="text-sm text-nova-grey mt-4"
        >
          {{ !selectedAppId ? 'Select an app first.' : 'Add an API key for this app first.' }}
        </p>
      </div>
    </div>

    <div class="mb-24">
      <label class="block text-telluric-blue text-sm uppercase tracking-wide mb-4">
        Run payload
      </label>
      <ace-editor
        id="composition-runner-payload"
        :key="'payload-' + payloadVersion"
        :default-value="payload"
        :styles="{ height: '180px', width: '100%' }"
        :on-change="onPayloadChange"
        :on-validate="onPayloadValidate"
      />
      <p
        v-if="payloadError"
        class="text-sm text-mars-1 mt-4"
      >
        Invalid JSON: {{ payloadError }}
      </p>
    </div>

    <div class="flex items-center">
      <button
        class="bg-nebula-blue text-white text-base font-semibold rounded px-24 py-12"
        :disabled="!canRun"
        :class="{ 'opacity-50 cursor-not-allowed': !canRun }"
        @click="onRun"
      >
        <span v-if="isLoading">⟳ Running…</span>
        <span v-else>Run query →</span>
      </button>
      <button
        class="ml-16 text-nebula-blue text-base underline"
        @click="toggleCurl"
      >
        Show curl {{ showCurl ? '▴' : '▾' }}
      </button>
    </div>

    <curl-block
      v-if="showCurl"
      class="mt-16"
    />
  </div>
</template>

<script>
    import AceEditor from 'common/components/editor/AceEditor.vue';
    import AppSelector from 'common/components/selectors/AppSelector.vue';
    import CompositionSelector from 'common/components/selectors/CompositionSelector.vue';
    import CurlBlock from './CurlBlock.vue';
    import { executeRun, parsePayload } from '../lib/runner';

    export default {
        name: 'RunForm',
        components: { AceEditor, AppSelector, CompositionSelector, CurlBlock },
        data() {
            return {
                payloadError: null,
            };
        },
        computed: {
            apps() {
                return this.$store.state.apps;
            },
            hasApps() {
                return Object.keys(this.apps).length > 0;
            },
            selectedAppId: {
                get() { return this.$store.state.compositionrunner.appId; },
                set(value) {
                    if (value === this.$store.state.compositionrunner.appId) return;
                    this.$store.commit('compositionrunner/setAppId', value);
                    this.$store.commit('compositionrunner/setCompositionId', '');
                },
            },
            apiKey() {
                if (!this.selectedAppId || !this.apps[this.selectedAppId]) return '';
                return this.apps[this.selectedAppId].key || '';
            },
            selectedCompositionId: {
                get() { return this.$store.state.compositionrunner.compositionId; },
                set(value) { this.$store.commit('compositionrunner/setCompositionId', value); },
            },
            payload() {
                return this.$store.state.compositionrunner.payload;
            },
            payloadVersion() {
                return this.$store.state.compositionrunner.payloadVersion;
            },
            showCurl() {
                return this.$store.state.compositionrunner.showCurl;
            },
            status() {
                return this.$store.state.compositionrunner.status;
            },
            isLoading() {
                return this.status === 'loading';
            },
            canRun() {
                if (this.isLoading) return false;
                if (!this.selectedAppId) return false;
                if (!this.apiKey) return false;
                if (!this.selectedCompositionId) return false;
                if (this.payloadError) return false;
                return parsePayload(this.payload).ok;
            },
        },
        methods: {
            onPayloadChange(text) {
                this.$store.commit('compositionrunner/setPayload', text);
            },
            onPayloadValidate(annotations) {
                const errors = (annotations || []).filter((a) => a.type === 'error');
                if (errors.length === 0) {
                    this.payloadError = null;
                    return;
                }
                const first = errors[0];
                this.payloadError = `line ${first.row + 1}: ${first.text}`;
            },
            openAppsPanel() {
                this.$store.commit('panels/setManageAppsPanel', true);
            },
            toggleCurl() {
                this.$store.commit('compositionrunner/setShowCurl', !this.showCurl);
            },
            async onRun() {
                const parsed = parsePayload(this.payload);
                if (!parsed.ok) {
                    this.payloadError = parsed.error;
                    return;
                }
                await executeRun(this.$store);
            },
        },
    };
</script>
