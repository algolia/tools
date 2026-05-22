<template>
  <button
    type="button"
    class="hit-card bg-white border rounded text-left flex flex-col"
    :class="injectedItemKey ? 'border-saturn-2 hit-card--injected' : 'border-proton-grey-opacity-60'"
    @click="onClick"
  >
    <injected-item-badge
      v-if="injectedItemKey"
      :value="injectedItemKey"
      size="card"
    />
    <div class="hit-card__id text-telluric-blue truncate">
      #{{ hit.objectID }}
    </div>
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="imageAlt"
      class="hit-card__thumb"
      loading="lazy"
      referrerpolicy="no-referrer"
    >
    <div
      v-else-if="previewText"
      class="hit-card__preview text-nova-grey"
    >
      {{ previewText }}
    </div>
  </button>
</template>

<script>
    import InjectedItemBadge from './InjectedItemBadge.vue';
    import hitMetadataMixin from '../mixins/hitMetadata';

    export default {
        name: 'HitCard',
        components: { InjectedItemBadge },
        mixins: [hitMetadataMixin],
        props: {
            hit: {
                type: Object,
                required: true,
            },
        },
        methods: {
            onClick() {
                this.$store.commit('compositionrunner/setOpenHit', { hit: this.hit });
            },
        },
    };
</script>

<style scoped>
    .hit-card {
        width: 140px;
        padding: 8px;
        gap: 6px;
        transition: box-shadow 0.15s ease-out;
        cursor: pointer;
    }
    .hit-card:hover,
    .hit-card:focus-visible {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        outline: none;
    }
    .hit-card--injected {
        box-shadow: inset 0 0 0 1px var(--cr-saturn-1);
    }
    .hit-card__id {
        font-family: var(--cr-mono);
        font-size: 0.78rem;
    }
    .hit-card__thumb {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 2px;
        background-color: rgba(0, 0, 0, 0.04);
    }
    .hit-card__preview {
        font-size: 0.78rem;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
