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

    <div v-else-if="status === 'success'">
      <div
        v-if="results.length === 0"
        class="bg-saturn-5 border border-saturn-3 rounded p-16"
      >
        <div class="text-telluric-blue text-lg font-bold">
          Request succeeded — 0 result sets returned · {{ elapsedMs }} ms
        </div>
        <applied-rules
          v-if="appliedRules.length"
          :rules="appliedRules"
          class="mt-8"
        />
        <p class="text-nova-grey text-base mt-12">
          The composition ran without errors but produced no result sets.
          Verify that the composition has at least one feed configured,
          that the run payload matches a documented schema, and try a less
          restrictive query.
        </p>
      </div>
      <div v-else>
        <div
          class="results-banner bg-saturn-5 border border-saturn-3 rounded p-16 mb-24"
        >
          <div class="text-telluric-blue text-lg font-bold">
            {{ summaryLine }}
          </div>
          <applied-rules
            v-if="appliedRules.length"
            :rules="appliedRules"
            class="mt-8"
          />
        </div>
        <result-set
          v-for="(result, idx) in results"
          :key="'set-' + idx"
          :result="result"
          :set-index="idx"
          :composition-id="compositionId"
        />
      </div>
    </div>
  </div>
</template>

<script>
    import EmptyState from './EmptyState.vue';
    import ErrorPanel from './ErrorPanel.vue';
    import ResultSet from './ResultSet.vue';
    import AppliedRules from './AppliedRules.vue';

    export default {
        name: 'RunResults',
        components: { EmptyState, ErrorPanel, ResultSet, AppliedRules },
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
            response() {
                return this.$store.state.compositionrunner.response;
            },
            results() {
                return this.response && Array.isArray(this.response.results)
                    ? this.response.results
                    : [];
            },
            appliedRules() {
                const r = this.response;
                if (!r || !r.compositions || !Array.isArray(r.compositions.run)) return [];
                const collected = new Set();
                for (const entry of r.compositions.run) {
                    if (!entry || !Array.isArray(entry.appliedRules)) continue;
                    for (const rule of entry.appliedRules) {
                        if (typeof rule === 'string' && rule.length > 0) {
                            collected.add(rule);
                        } else if (rule && typeof rule === 'object' && typeof rule.objectID === 'string' && rule.objectID.length > 0) {
                            collected.add(rule.objectID);
                        }
                    }
                }
                return Array.from(collected);
            },
            summaryLine() {
                const n = this.results.length;
                const label = n === 1 ? '1 result set returned' : `${n} result sets returned`;
                const ms = Number.isFinite(this.elapsedMs) ? `${this.elapsedMs} ms` : '';
                return ms ? `${label} · ${ms} total` : label;
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
