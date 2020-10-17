<template>
    <div class="hit mt-24 relative max-w-full" :class="expandImage ? 'w-full' : ''" @mousemove="expandable = true" @mouseleave="expandable = false">
        <div class="px-32 min-h-56">
            <div :id="`${panelKey}-${hitNumber}`" class="absolute top-0 left-0">
                <div
                    v-if="searchResponse.page !== undefined"
                    class="border border-nova-grey-opacity-80 text-center w-24 px-8 py-4 rounded text-xs uppercase text-solstice-blue"
                >
                    {{hitNumber}}
                </div>
                <div
                    v-if="displayMode === 'images' && expandable"
                    class="flex items-center justify-center mt-12 border border-proton-grey hover:border-nova-grey-opacity-80 p-4 w-24 rounded cursor-pointer"
                    @click="expandImage = !expandImage"
                >
                    <maximize-icon v-if="!expandImage" class="w-12 h-12 text-nova-grey" />
                    <minimize-icon v-if="expandImage" class="w-12 h-12 text-nova-grey" />
                </div>
            </div>
            <div v-if="!editMode">
                <div v-if="personalized || promoted" class="flex mb-12">
                    <div v-if="personalized" class="border border-nova-grey-opacity-80 px-8 py-4 rounded text-center text-xs uppercase tracking-wide text-solstice-blue">
                        Personalized
                    </div>
                    <div v-if="promoted" class="border border-nova-grey-opacity-80 px-8 py-4 rounded text-center text-xs uppercase tracking-wide text-solstice-blue">
                        Promoted
                    </div>
                </div>
                <hit-image
                    :flatten-hit="flattenHit"
                    :display-mode="displayMode"
                    :list-mode="listMode"
                    :imageSize="config.images.imageSize"
                    :forcedImageSize="config.images.imageSize"
                    :imageAttribute="config.images.imageAttribute"
                    :imageBaseUrl="config.images.imageBaseUrl"
                    :imageSuffixUrl="config.images.imageSuffixUrl"
                    :ignoreImageProxy="config.images.ignoreImageProxy"
                    v-bind="$props"
                    v-on="$listeners"
                />
            </div>
        </div>
        <div class="mb-8 w-full">
            <attributes
                :top-attributes="config.attributesToDisplay"
                :attributes="Object.keys(hit)"
                :hit="hit"
            />
        </div>
    </div>
</template>

<script>
import RankingInfo from 'common/components/explorer/hits/RankingInfo';
import HitsTransformer from 'common/components/explorer/hits/hitsTransformer';
import flattenRecord from 'common/utils/flattenRecordForImagePreview';
import HitEdit from 'common/components/explorer/hits/HitEdit';
import HitDelete from 'common/components/explorer/hits/HitDelete';
import HitImage from 'common/components/explorer/hits/HitImage';

import EditIcon from 'common/icons/edit.svg';
import TrashIcon from 'common/icons/trash.svg';
import FlipLeftIcon from "common/icons/flip-left.svg";
import FlipRightIcon from "common/icons/flip-right.svg";
import MaximizeIcon from "common/icons/maximize.svg";
import MinimizeIcon from "common/icons/minimize.svg";
import props from "common/components/explorer/props";
import Attributes from "./Attributes";

export default {
    name: 'MerchandizeHit',
    components: {
        Attributes,
        HitImage, HitDelete, HitEdit, RankingInfo, EditIcon, TrashIcon, FlipLeftIcon, FlipRightIcon, MaximizeIcon, MinimizeIcon},
    props: [
        'hit', 'previousHit', 'topAttributes', 'searchableAttributes', 'hitPosition', 'titleAttribute',
        ...props.credentials,
        ...props.attributes,
        ...props.actions,
        ...props.display,
        ...['imageAttribute', 'imageBaseUrl', 'imageSuffixUrl', 'ignoreImageProxy'],
        ...props.response,
        ...props.paramsAndSettings,
        'searchResponse',
        'config',
    ],
    data: function () {
        return {
            confirmDelete: false,
            editMode: false,
            expandImage: false,
            expandable: false,
            imageSize: this.config.images.imageSize,
            panelKey: 'leftPanel'
        }
    },
    computed: {
        listMode: function () {
            return this.displayMode === 'list' || this.expandImage;
        },
        imageMode: function () {
            return this.displayMode === 'images' && !this.expandImage;
        },
        flattenHit: function () {
            return flattenRecord(this.hit)
        },
        personalized: function () {
            return this.hit._rankingInfo && this.hit._rankingInfo.personalization && this.hit._rankingInfo.personalization.filtersScore > 0;
        },
        promoted: function () {
            return this.hit._rankingInfo && this.hit._rankingInfo.promoted;
        },
        hitNumber: function () {
            return this.searchResponse.hitsPerPage * this.searchResponse.page + this.hitPosition + 1;
        },
        imageAttributes: function () {
            let attributes = (this.searchParams.attributesToRetrieve || []).filter((attribute) => attribute && attribute !== this.imageAttribute);
            if (attributes.length <= 0) attributes = [this.titleAttribute];

            return attributes.map(this.attributeValue);
        },
        hitsTransformer: function () {
            return new HitsTransformer(['_highlightResult', '_snippetResult', '_distinctSeqID', '_rankingInfo']);
        },
        transformedItem: function () {
            return Object.freeze(this.hitsTransformer.transformObj(this.hit)._v_);
        },
    },
    methods: {
        attributeValue: function (attributeName) {
            if (this.hit._highlightResult && this.hit._highlightResult[attributeName] && this.hit._highlightResult[attributeName].value) {
                return this.hit._highlightResult[attributeName].value;
            }

            if (this.flattenHit[attributeName]) return this.flattenHit[attributeName];

            return this.hit[attributeName];
        }
    }
}
</script>
