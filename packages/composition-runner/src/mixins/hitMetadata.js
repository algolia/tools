import { findImageUrl, findPreviewText, getInjectedItemKey } from '../lib/runner';

// Consumers must define a `hit` data/prop/computed that returns either the hit
// object or null. The helpers below are null-safe, so the mixin does not guard.
export default {
    computed: {
        injectedItemKey() {
            return getInjectedItemKey(this.hit);
        },
        imageUrl() {
            return findImageUrl(this.hit);
        },
        previewText() {
            return findPreviewText(this.hit);
        },
        imageAlt() {
            return this.previewText || (this.hit && this.hit.objectID) || '';
        },
    },
};
