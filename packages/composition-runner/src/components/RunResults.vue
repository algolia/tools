<template>
  <div class="mt-24">
    <empty-state v-if="status === 'idle'" />

    <div
      v-else-if="status === 'loading'"
      class="flex items-center justify-center text-nova-grey text-base py-32"
    >
      <span class="spinner text-nebula-blue mr-12">⟳</span>
      <span>
        Running query against composition
        <strong
          v-if="compositionId"
          class="text-telluric-blue"
        >"{{ compositionId }}"</strong>
        <span v-else>…</span>
      </span>
    </div>

    <error-panel
      v-else-if="status === 'error'"
      :title="errorTitle"
      :message="errorMessage"
    />

    <div
      v-else-if="status === 'success'"
      class="text-nova-grey text-sm border border-dashed border-proton-grey-opacity-60 rounded p-16"
    >
      Response received in {{ elapsedMs }} ms.
      <br>
      <em>Result-set rendering lands in the next commit.</em>
    </div>
  </div>
</template>

<script>
    import EmptyState from './EmptyState.vue';
    import ErrorPanel from './ErrorPanel.vue';

    export default {
        name: 'RunResults',
        components: { EmptyState, ErrorPanel },
        computed: {
            status() {
                return this.$store.state.compositionrunner.status;
            },
            compositionId() {
                return this.$store.state.compositionrunner.compositionId;
            },
            elapsedMs() {
                return this.$store.state.compositionrunner.elapsedMs;
            },
            errorTitle() {
                const err = this.$store.state.compositionrunner.error;
                return err && err.title ? err.title : 'Request failed';
            },
            errorMessage() {
                const err = this.$store.state.compositionrunner.error;
                return err && err.message ? err.message : 'Unknown error.';
            },
        },
    };
</script>

<style scoped>
    @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
    }
    .spinner {
        display: inline-block;
        animation: spin 1s linear infinite;
        font-size: 1.25rem;
        line-height: 1;
    }
</style>
