<template>
  <div class="mb-24">
    <div class="set-header flex flex-wrap items-baseline border-b border-proton-grey-opacity-60 pb-8 mb-12">
      <span class="set-index">{{ setIndex }}</span>
      <span class="feed-id text-telluric-blue ml-12">{{ feedLabel }}</span>
      <span
        v-if="indexName"
        class="on-index ml-8 text-nova-grey"
      >
        on <em class="index-name">{{ indexName }}</em>
      </span>
      <span class="stats text-nova-grey-opacity-60 ml-auto">{{ stats }}</span>
    </div>

    <div
      v-if="hits.length === 0"
      class="text-nova-grey text-sm italic py-12"
    >
      This feed returned no hits.
    </div>
    <div
      v-else
      class="set-body"
    >
      <button
        v-if="hasPrev"
        type="button"
        class="page-btn text-nebula-blue"
        :disabled="paginating"
        aria-label="Previous page"
        @click="paginate(-1)"
      >
        ⟵
      </button>
      <div
        v-else
        class="page-btn page-btn--spacer"
        aria-hidden="true"
      />

      <div
        class="flex flex-wrap"
        style="gap: 12px;"
      >
        <hit-card
          v-for="(hit, idx) in hits"
          :key="hit.objectID || ('idx-' + idx)"
          :hit="hit"
        />
      </div>

      <button
        v-if="hasNext"
        type="button"
        class="page-btn text-nebula-blue"
        :disabled="paginating"
        aria-label="Next page"
        @click="paginate(+1)"
      >
        ⟶
      </button>
      <div
        v-else
        class="page-btn page-btn--spacer"
        aria-hidden="true"
      />
    </div>

    <p
      v-if="nbPages > 1"
      class="text-nova-grey-opacity-60 text-xs text-center mt-8"
    >
      Page {{ page + 1 }} of {{ nbPages }}<span v-if="hasNext"> — click ⟶ for the next page</span>
    </p>
  </div>
</template>

<script>
    import HitCard from './HitCard.vue';
    import { parsePayload, executeRun } from '../lib/runner';

    export default {
        name: 'ResultSet',
        components: { HitCard },
        props: {
            result: {
                type: Object,
                required: true,
            },
            setIndex: {
                type: Number,
                required: true,
            },
            compositionId: {
                type: String,
                required: true,
            },
        },
        data() {
            return { paginating: false };
        },
        computed: {
            hits() {
                return Array.isArray(this.result.hits) ? this.result.hits : [];
            },
            feedLabel() {
                if (this.result.feedID) return this.result.feedID;
                return `${this.compositionId} (main)`;
            },
            indexName() {
                return this.result.index || '';
            },
            nbHits() {
                return Number.isFinite(this.result.nbHits) ? this.result.nbHits : this.hits.length;
            },
            nbPages() {
                return Number.isFinite(this.result.nbPages) ? this.result.nbPages : 1;
            },
            page() {
                return Number.isFinite(this.result.page) ? this.result.page : 0;
            },
            hitsPerPage() {
                return Number.isFinite(this.result.hitsPerPage) ? this.result.hitsPerPage : this.hits.length;
            },
            stats() {
                return `${this.nbHits} hits · ${this.nbPages} page(s) · page ${this.page} · ${this.hitsPerPage}/page`;
            },
            hasPrev() {
                return this.page > 0;
            },
            hasNext() {
                return this.page < this.nbPages - 1;
            },
        },
        methods: {
            async paginate(direction) {
                const newPage = this.page + direction;
                if (newPage < 0 || newPage >= this.nbPages) return;
                if (this.paginating) return;

                const currentText = this.$store.state.compositionrunner.payload;
                const parsed = parsePayload(currentText);
                if (!parsed.ok) return;

                const next = { ...parsed.value };
                next.params = { ...(next.params || {}), page: newPage };
                const nextText = JSON.stringify(next, null, 2);

                this.paginating = true;
                this.$store.commit('compositionrunner/overwritePayload', nextText);
                try {
                    await executeRun(this.$store);
                } finally {
                    this.paginating = false;
                }
            },
        },
    };
</script>

<style scoped>
    .set-index {
        font-family: var(--cr-mono);
        font-size: 0.85rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.35);
    }
    .feed-id {
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1.2;
    }
    .on-index {
        font-size: 0.9rem;
    }
    .index-name {
        font-style: italic;
    }
    .stats {
        font-size: 0.78rem;
        font-variant-numeric: tabular-nums;
    }
    .set-body {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .set-body > .flex {
        flex: 1 1 auto;
        min-width: 0;
    }
    .page-btn {
        flex: 0 0 auto;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: 0;
        cursor: pointer;
        font-size: 1.25rem;
        line-height: 1;
        border-radius: 4px;
    }
    .page-btn:hover:not(:disabled),
    .page-btn:focus-visible:not(:disabled) {
        background-color: rgba(0, 0, 0, 0.05);
        outline: none;
    }
    .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .page-btn--spacer {
        cursor: default;
    }
</style>
