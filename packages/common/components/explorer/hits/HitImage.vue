<template>
  <div
    :class="[
      displayMode === 'autocomplete' ? '' : 'mb-24',
      !hasImage || (editImageAttributes && !forcedImageSize) ? 'rounded border border-proton-grey-opacity-60': '',
      (editImageAttributes && !forcedImageSize) ? 'p-8' : '',
      listMode && imageSize <= 160 ? 'float-right ml-16': ''
    ]"
  >
    <div
      class="flex justify-center items-center mx-auto"
      :class="[
        editImageAttributes && !forcedImageSize ? 'mt-12' : 'cursor-pointer',
        `w-${forcedImageSize || imageSize} h-${forcedImageSize || imageSize}`
      ]"
      @click="editImageAttributes = true"
    >
      <camera-icon
        v-if="!hasImage"
        class="w-16 h-16 text-proton-grey-opacity-60"
      />
      <img
        v-if="hasImage"
        class="rounded w-full h-full"
        style="object-fit: cover;"
        :src="proxyUrl"
      >
    </div>
    <div
      v-if="editImageAttributes && !forcedImageSize"
      class="p-12 text-center"
    >
      <div>
        <input
          class="w-128 bg-proton-grey-opacity-20 text-xs p-4"
          :value="imageAttribute"
          placeholder="image_attribute_name"
          @input="$emit('onUpdateImageAttribute', $event.target.value)"
        >
      </div>
      <div class="mt-2">
        <input
          class="w-128 bg-proton-grey-opacity-20 text-xs p-4"
          :value="imageBaseUrl"
          placeholder="base_image_url"
          @input="$emit('onUpdateImageBaseUrl', $event.target.value)"
        >
      </div>
      <div class="mt-2">
        <input
          class="w-128 bg-proton-grey-opacity-20 text-xs p-4"
          :value="imageSuffixUrl"
          placeholder="suffix_image_url"
          @input="$emit('onUpdateImageSuffixUrl', $event.target.value)"
        >
      </div>
      <div class="mt-2">
        <select v-model.number="size">
          <option value="40">
            40px
          </option>
          <option value="80">
            80px
          </option>
          <option value="120">
            120px
          </option>
          <option value="160">
            160px
          </option>
          <option value="200">
            200px
          </option>
          <option value="240">
            240px
          </option>
        </select>
      </div>
      <div class="mt-2">
        <label>
          <input
            v-model="shouldIgnoreImageProxy"
            type="checkbox"
          > disable image proxy
        </label>
      </div>
      <button
        class="mt-12 bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
        @click="editImageAttributes = false"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script>
import CameraIcon from 'common/icons/camera.svg';
import props from "../props";

const imageRegex = /(?:https?:)?\/\/.+\.(?:jpe?g|png|svg|webp)(?:\?.*)?$/i;

/**
 * Encodes a string into a URL-safe Base64 format.
 * @param {ArrayBuffer} buffer - The buffer to encode.
 * @returns {string} - The URL-safe Base64 encoded string.
 */
const urlSafeBase64 = (buffer) => {
  return arrayBufferToBase64(buffer)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Converts a hex string to a Uint8Array.
 * @param {string} hex - The hex string to decode.
 * @returns {Uint8Array} - The decoded bytes.
 */
const hexDecode = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

/**
 * Converts an ArrayBuffer to a Base64 encoded string.
 * @param {ArrayBuffer} buffer - The buffer to encode.
 * @returns {string} - The Base64 encoded string.
 */
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Generates a signed proxy image URL using the Web Crypto API.
 * @param {string} salt - The salt in hex format.
 * @param {string} target - The target string to sign.
 * @param {string} secret - The secret key in hex format.
 * @returns {Promise<string>} - The URL-safe Base64 encoded signature.
 */
const signedProxyImageUrl = async (salt, target, secret) => {
  const keyData = hexDecode(secret);
  const saltData = hexDecode(salt);
  const targetData = new TextEncoder().encode(target);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const data = new Uint8Array(saltData.length + targetData.length);
  data.set(saltData, 0);
  data.set(targetData, saltData.length);

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

  return urlSafeBase64(signature);
};

export default {
  name: 'HitImage',
  components: { CameraIcon },
  props: [
    'flattenHit', 'displayMode', 'listMode', 'forcedImageSize',
    ...props.images,
    ...props.display,
  ],
  data() {
    return {
      editImageAttributes: false,
      allowBlur: true,
      proxyUrl: this.fullUrl, // Initialize proxyUrl with fullUrl
    };
  },
  computed: {
    fullUrl() {
      return `${this.imageBaseUrl}${this.image}${this.imageSuffixUrl}`;
    },
    size: {
      get() {
        return this.imageSize;
      },
      set(val) {
        this.$emit('onUpdateImageSize', val);
      },
    },
    shouldIgnoreImageProxy: {
      get() {
        return this.ignoreImageProxy;
      },
      set(value) {
        this.$emit('onUpdateIgnoreImageProxy', value);
      },
    },
    imageAttributeName() {
      if (!this.imageAttribute || !this.flattenHit[this.imageAttribute]) {
        this.autoFindImageAttributeName();
      }
      return this.imageAttribute;
    },
    hasImage() {
      return this.imageAttributeName && this.image;
    },
    image() {
      return this.flattenHit[this.imageAttributeName];
    },
  },
  watch: {
    // Recompute proxyUrl when dependencies change
    fullUrl: 'computeProxyUrl',
    shouldIgnoreImageProxy: 'computeProxyUrl',
    imageSize: 'computeProxyUrl',
    forcedImageSize: 'computeProxyUrl',
  },
  created() {
    this.computeProxyUrl();
  },
  methods: {
    // Auto-detect the image attribute name
    autoFindImageAttributeName() {
      for (const key in this.flattenHit) {
        if (
          this.flattenHit[key].length <= 1000 &&
          this.flattenHit[key].match(imageRegex)
        ) {
          this.$emit('onUpdateImageAttribute', key);
        }
      }
      return this.imageAttribute;
    },
    // Compute the proxy URL asynchronously
    async computeProxyUrl() {
      const proxy = window.imageProxy;

      if (this.shouldIgnoreImageProxy || !proxy) {
        this.proxyUrl = this.fullUrl;
        return;
      }

      const size = this.forcedImageSize || this.imageSize;
      const modifiers = {
        resizing_type: 'fill',
        width: size,
        height: size,
        gravity: 'sm',
        enlarge: true,
        extend: true,
      };
      const smodifiers = Object.keys(modifiers)
        .map(
          (modifierKey) => `${modifierKey}:${modifiers[modifierKey]}`
        )
        .join('/');
      const path = `/${smodifiers}/${urlSafeBase64(
        new TextEncoder().encode(this.fullUrl)
      )}.jpg`;

      const signature = await signedProxyImageUrl(
        proxy.signingSalt,
        path,
        proxy.signingKey
      );

      this.proxyUrl = `${proxy.baseUrl}${signature}${path}`;
    },
  },
};
</script>
