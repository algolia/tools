<template>
  <div
    v-if="openHit"
    class="hit-modal-backdrop"
    @click="close"
  >
    <div
      class="hit-modal bg-white"
      role="dialog"
      aria-modal="true"
      :aria-label="'Hit ' + openHit.hit.objectID"
      @click.stop
    >
      <div class="hit-modal__header">
        <span class="hit-modal__id">#{{ openHit.hit.objectID }}</span>
        <injected-item-badge
          v-if="injectedItemKey"
          :value="injectedItemKey"
          size="modal"
        />
        <button
          ref="closeButton"
          type="button"
          class="hit-modal__close text-nova-grey"
          aria-label="Close"
          @click="close"
        >
          ×
        </button>
      </div>
      <div class="hit-modal__body">
        <p
          v-if="previewText"
          class="hit-modal__preview text-telluric-blue"
        >
          {{ previewText }}
        </p>
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="imageAlt"
          class="hit-modal__image"
          referrerpolicy="no-referrer"
        >
        <pre class="hit-modal__pre bg-proton-grey-opacity-40 text-solstice-blue"><code>{{ json }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
    import InjectedItemBadge from './InjectedItemBadge.vue';
    import hitMetadataMixin from '../mixins/hitMetadata';

    export default {
        name: 'HitModal',
        components: { InjectedItemBadge },
        mixins: [hitMetadataMixin],
        computed: {
            openHit() {
                return this.$store.state.compositionrunner.openHit;
            },
            hit() {
                return this.openHit ? this.openHit.hit : null;
            },
            json() {
                if (!this.hit) return '';
                try {
                    return JSON.stringify(this.hit, null, 2);
                } catch (err) {
                    return String(err);
                }
            },
        },
        watch: {
            openHit(value) {
                if (value) {
                    this.$nextTick(() => {
                        if (this.$refs.closeButton && this.$refs.closeButton.focus) {
                            this.$refs.closeButton.focus();
                        }
                    });
                }
            },
        },
        created() {
            this.boundEscHandler = (event) => {
                if (event.key === 'Escape' && this.openHit) {
                    event.stopPropagation();
                    this.close();
                }
            };
            window.addEventListener('keydown', this.boundEscHandler);
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.boundEscHandler);
        },
        methods: {
            close() {
                this.$store.commit('compositionrunner/setOpenHit', null);
            },
        },
    };
</script>

<style scoped>
    .hit-modal-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(28, 40, 69, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 24px;
    }
    .hit-modal {
        width: 100%;
        max-width: 680px;
        max-height: calc(100vh - 48px);
        display: flex;
        flex-direction: column;
        border-radius: 6px;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
        overflow: hidden;
    }
    .hit-modal__header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .hit-modal__id {
        font-family: var(--cr-mono);
        font-size: 0.95rem;
        color: inherit;
    }
    .hit-modal__close {
        margin-left: auto;
        background: none;
        border: 0;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        padding: 0 4px;
    }
    .hit-modal__close:hover,
    .hit-modal__close:focus-visible {
        color: #000;
        outline: none;
    }
    .hit-modal__body {
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .hit-modal__preview {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
    }
    .hit-modal__image {
        max-height: 300px;
        width: auto;
        align-self: center;
        object-fit: contain;
        border-radius: 4px;
    }
    .hit-modal__pre {
        font-family: var(--cr-mono);
        font-size: 0.78rem;
        line-height: 1.4;
        padding: 12px;
        border-radius: 4px;
        max-height: 50vh;
        overflow: auto;
        margin: 0;
        white-space: pre;
    }
</style>
