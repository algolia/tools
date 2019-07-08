<template>
    <div class="hit mt-24 relative max-w-full" :class="expandImage ? 'w-full' : ''" @mousemove="expandable = true" @mouseleave="expandable = false">
        <div class="px-32 min-h-56">
            <div :id="`${panelKey}-${hitNumber}`" class="absolute pin-t pin-l">
                <div class="h-24 w-24 bg-proton-grey-opacity-40 rounded text-center leading-normal">
                    {{hitNumber}}
                </div>
                <div
                    v-if="displayMode === 'images' && expandable"
                    class="flex items-center justify-center mt-12 border border-proton-grey hover:border-nova-grey-opacity-80 w-24 h-24 rounded cursor-pointer"
                    @click="expandImage = !expandImage"
                >
                    <maximize-icon v-if="!expandImage" class="w-12 h-12 text-nova-grey" />
                    <minimize-icon v-if="expandImage" class="w-12 h-12 text-nova-grey" />
                </div>
            </div>
            <div v-if="!editMode">
                <hit-image :flatten-hit="flattenHit" :panel-key="panelKey" :display-mode="displayMode" :list-mode="listMode" />
                <div v-if="imageMode && panelImageSize >= 120" class="mb-8" :class="`w-${panelImageSize}`">
                    <div class="truncate">{{hit.objectID}}</div>
                    <div class="truncate" v-if="title" v-html="title" />
                </div>
                <div v-if="personalized || promoted" class="flex mb-12">
                    <div v-if="personalized" class="border border-nova-grey-opacity-80 px-8 py-4 rounded">
                        Personalized
                    </div>
                    <div v-if="promoted" class="border border-nova-grey-opacity-80 px-8 py-4 rounded">
                        Promoted
                    </div>
                </div>
                <attributes
                    v-if="listMode"
                    :top-attributes="topAttributes"
                    :item="transformedItem"
                />
                <ranking-info
                    class="mt-48"
                    v-if="$store.state.panels.displayRankingInfo && listMode"
                    :panel-key="panelKey"
                    :item="hit"
                    :previous-item="previousHit"
                    :i="hitPosition"
                />
                <div class="clearfix"></div>
                <div v-if="listMode" class="flex justify-end items-center text-nova-grey-opacity-80">
                    <button class="relative group">
                        <flip-left-icon
                            v-if="recordCanJump && panelKey === 'rightPanel'"
                            class="text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="jumpRecord"
                        />
                        <tooltip>Copy this record in the left panel index.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <flip-right-icon
                            v-if="recordCanJump && panelKey === 'leftPanel'"
                            class="text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="jumpRecord"
                        />
                        <tooltip>Copy this record in the right panel index.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <edit-icon
                            v-if="!isReadOnly"
                            class="ml-12 text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="editMode = true"
                        />
                        <tooltip>Edit this record.<br>Will ask for confirmation</tooltip>
                    </button>
                    <button class="relative group">
                        <trash-icon
                            v-if="!isReadOnly"
                            class="ml-12 text-nova-grey-opacity-80 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                            @click="confirmDelete = true"
                        />
                        <tooltip>Delete this record.<br>Will ask for confirmation</tooltip>
                    </button>
                    <div v-if="isReadOnly" class="ml-12">
                        Read-only replica
                    </div>
                </div>
            </div>
            <hit-delete
                v-if="confirmDelete"
                @onStopDelete="confirmDelete = false"
                :hit="hit"
                :panel-key="panelKey"
            />
            <hit-edit
                v-if="editMode"
                :hit="hit"
                @onStopEdit="editMode = false"
                :panel-key="panelKey"
            />
        </div>
        <div v-if="listMode" class="mt-24 mx-32 border-t border-proton-grey-opacity-40"></div>
    </div>
</template>

<script>
    import Attributes from '@/explorer/hits/Attributes';
    import RankingInfo from '@/explorer/hits/RankingInfo';
    import HitsTransformer from '@/explorer/hits/hitsTransformer';
    import flattenRecord from 'common/utils/flattenRecordForImagePreview';
    import HitEdit from '@/explorer/hits/HitEdit';
    import HitDelete from '@/explorer/hits/HitDelete';
    import HitImage from "@/explorer/hits/HitImage";
    import indexInfoMixin from "@/mixins/indexInfoMixin";

    import EditIcon from 'common/icons/edit.svg';
    import TrashIcon from 'common/icons/trash.svg';
    import FlipLeftIcon from "common/icons/flip-left.svg";
    import FlipRightIcon from "common/icons/flip-right.svg";
    import MaximizeIcon from "common/icons/maximize.svg";
    import MinimizeIcon from "common/icons/minimize.svg";
    import Tooltip from "@/common/Tooltip";

    const hitsTransformer = new HitsTransformer(['_highlightResult', '_snippetResult', '_rankingInfo', '_distinctSeqID']);

    export default {
        name: 'Hit',
        components: {
            Tooltip,
            HitImage, HitDelete, HitEdit, RankingInfo, Attributes, EditIcon, TrashIcon, FlipLeftIcon, FlipRightIcon, MaximizeIcon, MinimizeIcon},
        mixins: [indexInfoMixin],
        props: ['algoliaResponse', 'panelKey', 'topAttributes', 'hit', 'previousHit', 'hitPosition', 'displayMode', 'recordCanJump', 'titleAttribute'],
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
                return this.hit._rankingInfo.personalization && this.hit._rankingInfo.personalization.filtersScore > 0;
            },
            promoted: function () {
                return this.hit._rankingInfo.promoted;
            },
            hitNumber: function () {
                return this.algoliaResponse.hitsPerPage * this.algoliaResponse.page + this.hitPosition + 1;
            },
            title: function () {
                if (this.hit._highlightResult[this.titleAttribute] && this.hit._highlightResult[this.titleAttribute].value) {
                    return this.hit._highlightResult[this.titleAttribute].value;
                }

                return this.flattenHit[this.titleAttribute];
            },
            transformedItem: function () {
                return Object.freeze(hitsTransformer.transformObj(this.hit)._v_);
            }
        },
        methods: {
            jumpRecord: function () {
                const otherPanelKey = this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
                this.$root.$emit(`${otherPanelKey}HitJumping`, this.hit);
            },
        }
    }
</script>