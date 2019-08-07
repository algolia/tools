<template>
    <div
        :class="[
            displayMode === 'autocomplete' ? '' : 'mb-24',
            !hasImage || (editImageAttributes && !forcedSize) ? 'rounded border border-proton-grey-opacity-60': '',
            (editImageAttributes && !forcedSize) ? 'p-8' : '',
            listMode && panelImageSize <= 160 ? 'float-right ml-16': ''
        ]"
    >
        <div
            @click="editImageAttributes = true"
            class="flex justify-center items-center mx-auto"
            :class="[
                editImageAttributes && !forcedSize ? 'mt-12' : 'cursor-pointer',
                `w-${forcedSize || panelImageSize} h-${forcedSize || panelImageSize}`
            ]"
        >
            <camera-icon v-if="!hasImage" class="w-16 h-16 text-proton-grey-opacity-60"></camera-icon>
            <img
                v-if="hasImage"
                class="rounded w-full h-full"
                style="object-fit: cover;"
                :src="`https://rocky-thicket-17824.herokuapp.com/${forcedSize || panelImageSize}/${panelImageBaseUrl}${image}${panelImageSuffixUrl}`"
            />
        </div>
        <div v-if="editImageAttributes && !forcedSize" class="p-12 text-center">
            <div>
                <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4" v-model="panelImageAttributeName" placeholder="image_attribute_name"/>
            </div>
            <div class="mt-2">
                <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4" v-model="panelImageBaseUrl" placeholder="base_image_url" />
            </div>
            <div class="mt-2">
                <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4" v-model="panelImageSuffixUrl" placeholder="suffix_image_url" />
            </div>
            <div class="mt-2">
                <select v-model.number="panelImageSize">
                    <option value="40">40px</option>
                    <option value="80">80px</option>
                    <option value="120">120px</option>
                    <option value="160">160px</option>
                    <option value="200">200px</option>
                    <option value="240">240px</option>
                </select>
            </div>
            <button class="mt-12 bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm" @click="editImageAttributes = false">
                Close
            </button>
        </div>
    </div>
</template>

<script>
    import CameraIcon from 'common/icons/camera.svg';
    import indexInfoMixin from "../../../mixins/indexInfoMixin";

    const imageRegex = /(?:https?:)?\/\/.+\.(?:jpe?g|png|svg|webp)(?:\?.*)?$/i;

    export default {
        name: 'HitImage',
        props: ['panelKey', 'flattenHit', 'displayMode', 'listMode', 'forcedSize'],
        components: {CameraIcon},
        mixins: [indexInfoMixin],
        data: function () {
            return {
                editImageAttributes: false,
                allowBlur: true,
            }
        },
        computed: {
            imageAttributeName: function () {
                if (!this.panelImageAttributeName) {
                    this.autoFindImageAttributeName();
                }
                return this.panelImageAttributeName;
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
                        this.panelImageAttributeName = key;
                    }
                }

                return this.panelImageAttributeName;
            },
        },
    }
</script>