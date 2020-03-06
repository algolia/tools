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
            @click="editImageAttributes = true"
            class="flex justify-center items-center mx-auto"
            :class="[
                editImageAttributes && !forcedImageSize ? 'mt-12' : 'cursor-pointer',
                `w-${forcedImageSize || imageSize} h-${forcedImageSize || imageSize}`
            ]"
        >
            <camera-icon v-if="!hasImage" class="w-16 h-16 text-proton-grey-opacity-60"></camera-icon>
            <img
                v-if="hasImage"
                class="rounded w-full h-full"
                style="object-fit: cover;"
                :src="`${proxyUrl}${imageBaseUrl}${image}${imageSuffixUrl}`"
            />
        </div>
        <div v-if="editImageAttributes && !forcedImageSize" class="p-12 text-center">
            <div>
                <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4"
                       :value="imageAttribute"
                       @input="$emit('onUpdateImageAttribute', $event.target.value)"
                       placeholder="image_attribute_name"
                />
            </div>
            <div class="mt-2">
                <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4"
                       :value="imageBaseUrl"
                       @input="$emit('onUpdateImageBaseUrl', $event.target.value)"
                       placeholder="base_image_url" />
            </div>
            <div class="mt-2">
                <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4"
                       :value="imageSuffixUrl"
                       @input="$emit('onUpdateImageSuffixUrl', $event.target.value)"
                       placeholder="suffix_image_url" />
            </div>
            <div class="mt-2">
                <select v-model.number="size">
                    <option value="40">40px</option>
                    <option value="80">80px</option>
                    <option value="120">120px</option>
                    <option value="160">160px</option>
                    <option value="200">200px</option>
                    <option value="240">240px</option>
                </select>
            </div>
            <div class="mt-2">
                <input type="checkbox" v-model="shouldIgnoreImageProxy" /> disable image proxy
            </div>
            <button class="mt-12 bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm" @click="editImageAttributes = false">
                Close
            </button>
        </div>
    </div>
</template>

<script>
    import CameraIcon from 'common/icons/camera.svg';
    import props from "../props";

    const imageRegex = /(?:https?:)?\/\/.+\.(?:jpe?g|png|svg|webp)(?:\?.*)?$/i;

    export default {
        name: 'HitImage',
        props: [
            'flattenHit', 'displayMode', 'listMode', 'forcedImageSize',
            ...props.images,
            ...props.display,
        ],
        components: {CameraIcon},
        data: function () {
            return {
                editImageAttributes: false,
                allowBlur: true,
            }
        },
        computed: {
            proxyUrl: function () {
                if (this.shouldIgnoreImageProxy) {
                    return '';
                }
                return `https://rocky-thicket-17824.herokuapp.com/${this.forcedImageSize || this.imageSize}/`;
            },
            size: {
                get () {
                    return this.imageSize;
                },
                set (val) {
                    this.$emit('onUpdateImageSize', val);
                }
            },
            shouldIgnoreImageProxy: {
                get () {
                    return this.ignoreImageProxy;
                },
                set (value) {
                    this.$emit('onUpdateIgnoreImageProxy', value);
                }
            },
            imageAttributeName: function () {
                if (!this.imageAttribute || !this.flattenHit[this.imageAttribute]) {
                    this.autoFindImageAttributeName();
                }
                return this.imageAttribute;
            },
            hasImage: function () {
                return this.imageAttributeName && this.image;
            },
            image: function () {
                return this.flattenHit[this.imageAttributeName];
            },
        },
        methods: {
            // @todo optimise to not do it for every hit.
            autoFindImageAttributeName: function () {
                let key;
                for (key in this.flattenHit) {
                    if (this.flattenHit[key].length <= 1000 && this.flattenHit[key].match(imageRegex)) {
                        this.$emit('onUpdateImageAttribute', key);
                    }
                }

                return this.imageAttribute;
            },
        },
    }
</script>
