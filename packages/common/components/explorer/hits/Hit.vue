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
                <hit-image
                    :flatten-hit="flattenHit"
                    :display-mode="displayMode"
                    :list-mode="listMode"
                    v-bind="$props"
                    v-on="$listeners"
                />
                <div v-if="imageMode && imageSize >= 120" class="mb-8" :class="`w-${imageSize}`">
                    <div class="truncate">{{hit.objectID}}</div>
                    <div v-for="attribute in imageAttributes" :key="attribute">
                        <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
                        <div class="truncate" v-if="attribute" v-html="escapeHtml(attribute)" />
                    </div>
                </div>
                <div v-if="personalized || promoted || reranked" class="flex mb-12">
                    <div v-if="personalized" class="border border-nova-grey-opacity-80 px-8 py-4 rounded text-center text-xs uppercase tracking-wide text-solstice-blue">
                        Personalized
                    </div>
                    <div v-if="promoted" class="border border-nova-grey-opacity-80 px-8 py-4 rounded text-center text-xs uppercase tracking-wide text-solstice-blue">
                        Promoted
                    </div>
                    <div v-if="reranked" class="border border-nova-grey-opacity-80 px-8 py-4 rounded text-center text-xs uppercase tracking-wide text-solstice-blue">
                        Reranked
                    </div>
                </div>
                <attributes
                    v-if="listMode"
                    :top-attributes="topAttributes"
                    :searchable-attributes="searchableAttributes"
                    :item="transformedItem"
                    v-bind="$props"
                    v-on="$listeners"
                />
                <ranking-info
                    class="mt-48"
                    v-if="hit._rankingInfo && displayRankingInfo && listMode"
                    :item="hit"
                    :previous-item="previousHit"
                    :i="hitPosition"
                    :index-settings="indexSettings"
                    :search-params="searchParams"
                    :neural-search-info="neuralSearchInfo"
                />
                <div class="clearfix"></div>
                <div v-if="listMode" class="flex justify-end items-center text-nova-grey-opacity-80">
                    <button class="relative group">
                        <flip-left-icon
                            v-if="canJumpRecords && jumpTo === 'leftPanel'"
                            class="text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="jumpRecord"
                        />
                        <tooltip>Copy this record in the left panel index.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <flip-right-icon
                            v-if="canJumpRecords && jumpTo === 'rightPanel'"
                            class="text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="jumpRecord"
                        />
                        <tooltip>Copy this record in the right panel index.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <edit-icon
                            v-if="!readOnly && !isReplica"
                            class="ml-12 text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="editMode = true"
                        />
                        <tooltip>Edit this record.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <trash-icon
                            v-if="!readOnly && !isReplica"
                            class="ml-12 text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="confirmDelete = true"
                        />
                        <tooltip>Delete this record.<br>Will ask for confirmation</tooltip>
                    </button>
                    <div v-if="!readOnly && isReplica" class="ml-12">
                        Read-only replica
                    </div>
                </div>
            </div>
            <hit-delete
                v-if="confirmDelete"
                @onStopDelete="confirmDelete = false"
                :hit="hit"
                v-bind="$props"
                v-on="$listeners"
            />
            <hit-edit
                v-if="editMode"
                :hit="hit"
                @onStopEdit="editMode = false"
                v-bind="$props"
                v-on="$listeners"
            />
        </div>
        <div v-if="listMode" class="mt-24 mx-32 border-t border-proton-grey-opacity-40"></div>
    </div>
</template>

<script>
    import Attributes from './Attributes.vue';
    import RankingInfo from './RankingInfo.vue';
    import HitsTransformer from './hitsTransformer';
    import flattenRecord from 'common/utils/flattenRecordForImagePreview';
    import {escapeHtml} from "common/utils/formatters";
    import HitEdit from './HitEdit.vue';
    import HitDelete from './HitDelete.vue';
    import HitImage from "./HitImage.vue";

    import EditIcon from 'common/icons/edit.svg';
    import TrashIcon from 'common/icons/trash.svg';
    import FlipLeftIcon from "common/icons/flip-left.svg";
    import FlipRightIcon from "common/icons/flip-right.svg";
    import MaximizeIcon from "common/icons/maximize.svg";
    import MinimizeIcon from "common/icons/minimize.svg";
    import Tooltip from "../../Tooltip.vue";
    import props from "../props";

    export default {
        name: 'Hit',
        components: {
            Tooltip,
            HitImage, HitDelete, HitEdit, RankingInfo, Attributes, EditIcon, TrashIcon, FlipLeftIcon, FlipRightIcon, MaximizeIcon, MinimizeIcon},
        props: [
            'panelKey', 'hit', 'previousHit', 'topAttributes', 'searchableAttributes', 'hitPosition', 'titleAttribute',
            'neuralSearchInfo',
            ...props.credentials,
            ...props.attributes,
            ...props.actions,
            ...props.display,
            ...props.images,
            ...props.response,
            ...props.paramsAndSettings,
        ],
        data: function () {
            return {
                confirmDelete: false,
                editMode: false,
                expandImage: false,
                expandable: false,
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
                return this.hit._rankingInfo && this.hit._rankingInfo.promoted && !this.hit._rankingInfo.promotedByReRanking;
            },
            reranked: function () {
                return this.hit._rankingInfo && this.hit._rankingInfo.promotedByReRanking;
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
                const excludedAttributes = ['_highlightResult', '_snippetResult', '_distinctSeqID'];

                if (this.searchParams.getRankingInfo !== true) {
                    excludedAttributes.push('_rankingInfo');
                }

                return new HitsTransformer(excludedAttributes);
            },
            transformedItem: function () {
                return Object.freeze(this.hitsTransformer.transformObj(this.hit)._v_);
            },
        },
        methods: {
            jumpRecord: function () {
                this.$root.$emit(`${this.jumpTo}HitJumping`, this.hit);
                window.scrollTo(0, 0);
            },
            attributeValue: function (attributeName) {
                if (this.hit._highlightResult && this.hit._highlightResult[attributeName] && this.hit._highlightResult[attributeName].value) {
                    return this.hit._highlightResult[attributeName].value;
                }

                if (this.flattenHit[attributeName]) return this.flattenHit[attributeName];

                return this.hit[attributeName];
            },
            escapeHtml,
        }
    }
</script>
