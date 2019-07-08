<template>
    <div v-if="leftHits && rightHits" class="mt-16">
        <div class="text-solstice-blue-opacity-80">
            <div class="font-bold">
                Nb of points : <input type="number" v-model="analyseMaxNbPoints" min="1" style="width: 50px;"/>
            </div>
            <div class="font-bold mt-12 mb-4">
                Tracked objectIDs:
            </div>
            <div class="">
                <div
                    v-for="(objectID, index) in trackedObjectIDs"
                    class="flex"
                >
                    <div v-if="index < trackedObjectIDs.length - 1" class="truncate" style="width: calc(100% - 48px);">
                        <span class="font-bold">{{String.fromCharCode(97 + index)}}.</span>&nbsp;
                        <span v-if="index < trackedObjectIDs.length - 1">
                            {{objectID}}
                        </span>
                        <input v-else
                            class="input-custom float-left ml-0 mr-0"
                            v-model="trackedObjectIDs[trackedObjectIDs.length - 1]"
                            @keyup.enter="addTrackedObjectID"
                        />
                    </div>
                    <div v-else class="flex" style="width: calc(100% - 48px);">
                        <span class="font-bold">{{String.fromCharCode(97 + trackedObjectIDs.length - 1)}}.</span>&nbsp;
                        <input
                           class="input-custom w-full ml-0 mr-0"
                           v-model="trackedObjectIDs[trackedObjectIDs.length - 1]"
                           @keyup.enter="addTrackedObjectID"
                        />
                    </div>
                    <div class="ml-auto w-12 h-12">
                        <login-icon
                            v-if="leftHits.some((hit) => { return hit === objectID})"
                            class="w-full h-full cursor-pointer rotate-180"
                            @click="goToHit(leftHits.findIndex((hit) => { return hit === objectID}) + 1, 'leftPanel')"
                        />
                    </div>
                    <div class="ml-4 w-12 h-12">
                        <login-icon
                            v-if="rightHits.some((hit) => { return hit === objectID})"
                            class="w-full h-full cursor-pointer"
                            @click="goToHit(rightHits.findIndex((hit) => { return hit === objectID}) + 1, 'rightPanel')"
                        />
                    </div>
                    <div class="ml-4 w-12 h-12">
                        <trash-icon
                            v-if="index < trackedObjectIDs.length - 1"
                            class="w-full h-full ml-4 cursor-pointer"
                            @click="removeTrackedObjectID(index)"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div>
            <svg :width="width" :height="Math.max(leftHits.length, rightHits.length) * spaceBetweenCircle + 50">
                <defs>
                    <marker id="arrowhead" markerWidth="5" markerHeight="4" refX="0" refY="2" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="gray" />
                    </marker>
                </defs>
                <g v-for="(hit, i) in leftHits">
                    <line
                        v-if="posr(hit) !== -1 && $store.state.panels.splitMode"
                        :x1="circleX"
                        :y1="spaceBetweenCircle * i + 36"
                        :x2="width - circleX"
                        :y2="spaceBetweenCircle * posr(hit) + 36"
                        :stroke="circleFilledColorTransparent"
                        stroke-width="2"
                    />
                </g>
                <g v-for="(hit, i) in leftHits">
                    <g class="cursor-pointer" @click="goToHit(i + 1, 'leftPanel')">
                        <circle
                            :r="radius"
                            :cx="circleX"
                            :cy="spaceBetweenCircle * i + 36"
                            :fill="hitColor(true, hit)"
                            :stroke="personalized(hit) ? circleStrokeColorPerso : 'gray'"
                            stroke-width="2"
                        />
                        <text :x="circleX - textMargin" :y="spaceBetweenCircle * i + 40" font-size="12" fill="gray" text-anchor="end">
                            {{i + 1}}
                        </text>
                        <g v-if="trackedObjectIDs.indexOf(hit.objectID) !== -1">
                            <line
                                :x1="circleX - textMargin - 35" :y1="spaceBetweenCircle * i + 36"
                                :x2="circleX - textMargin - 25" :y2="spaceBetweenCircle * i + 36"
                                stroke="gray" stroke-width="2" marker-end="url(#arrowhead)"
                            />
                            <text :x="circleX - textMargin - 40" :y="spaceBetweenCircle * i + 38" font-size="12" fill="gray" text-anchor="end">
                                {{String.fromCharCode(97 + trackedObjectIDs.indexOf(hit.objectID))}}.
                            </text>
                        </g>
                    </g>
                </g>
                <g v-if="$store.state.panels.splitMode">
                    <g class="cursor-pointer" v-for="(hit, i) in rightHits" @click="goToHit(i + 1, 'rightPanel')">
                        <circle
                            :r="radius"
                            :cx="width - circleX"
                            :cy="spaceBetweenCircle * i + 36"
                            :fill="hitColor(false, hit)"
                            :stroke="personalized(hit) ? circleStrokeColorPerso : 'gray'"
                            stroke-width="2"
                        />
                        <text :x="width - circleX + textMargin" :y="spaceBetweenCircle * i + 40" font-size="12" fill="gray"
                              text-anchor="start">{{i + 1}}
                        </text>
                        <g v-if="trackedObjectIDs.indexOf(hit.objectID) !== -1">
                            <line
                                :x1="width - circleX + textMargin + 35" :y1="spaceBetweenCircle * i + 36"
                                :x2="width - circleX + textMargin + 25" :y2="spaceBetweenCircle * i + 36"
                                stroke="gray" stroke-width="2" marker-end="url(#arrowhead)"
                            />
                            <text :x="width - circleX + textMargin + 40" :y="spaceBetweenCircle * i + 38" font-size="12" fill="gray" text-anchor="start">
                                {{String.fromCharCode(97 + trackedObjectIDs.indexOf(hit.objectID))}}.
                            </text>
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import {goToAnchor} from "common/src/utils/domHelpers";
    import panelsMixin from "@/mixins/panelsMixin";
    import TrashIcon from '~/icons/trash.svg';
    import LoginIcon from '~/icons/log-in.svg';

    export default {
        name: 'CompareHits',
        components: {TrashIcon, LoginIcon},
        mixins: [panelsMixin],
        data: function () {
            return {
                width: 224,
                radius: 5,
                circleX: 71,
                textMargin: 10,
                spaceBetweenCircle: 15,
                circleFilledColor: '#8d97e3',
                circleStrokeColorPerso: '#e34340',
                circleFilledColorTransparent: 'rgba(166, 176, 249, 0.8)',
                trackedObjectIDs: [''],
            }
        },
        computed: {
            leftResponse: function () {
                return this.$store.state.panels['leftPanel'].algoliaResponse;
            },
            rightResponse: function () {
                return this.$store.state.panels['rightPanel'].algoliaResponse;
            },
            leftHits: function () {
                if (this.leftResponse && this.leftResponse.hits) {
                    return this.leftResponse.hits;
                }
                return [];
            },
            rightHits: function () {
                if (this.rightResponse && this.rightResponse.hits) {
                    return this.rightResponse.hits;
                }
                return [];
            },
        },
        methods: {
            personalized(hit) {
                return hit._rankingInfo.personalization && hit._rankingInfo.personalization.filtersScore > 0;
            },
            hitColor: function (isLeft, hit) {
                if (isLeft) {
                    if (!this.$store.state.panels.splitMode || this.posr(hit) !== -1) {
                        return this.circleFilledColor;
                    }
                    return 'white';
                }

                if (this.posl(hit) !== -1) {
                    return this.circleFilledColor;
                }
                return 'white';
            },
            posr: function (hit) {
                return this.rightHits.findIndex((h) => h.objectID === hit.objectID);
            },
            posl: function (hit) {
                return this.leftHits.findIndex((h) => h.objectID === hit.objectID);
            },
            addTrackedObjectID: function () {
                if (this.trackedObjectIDs[this.trackedObjectIDs.length - 1].length > 0) {
                    this.trackedObjectIDs.push('');
                }
            },
            removeTrackedObjectID: function (index) {
                this.trackedObjectIDs.splice(index, 1);
            },
            goToHit: function (i, panelKey) {
                const otherPanelKey = panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
                const appId = this.$store.state.panels[panelKey].appId;
                const indexName = this.$store.state.panels[panelKey].indexName;
                const otherAppId = this.$store.state.panels[otherPanelKey].appId;
                const otherIndexName = this.$store.state.panels[otherPanelKey].indexName;
                const isSameIndexOnBothPanels = appId === otherAppId && indexName === otherIndexName;
                const searchConfigKey = isSameIndexOnBothPanels && panelKey === 'rightPanel' ? 'searchParams2' : 'searchParams';
                const searchParamsRaw = this.$store.state.apps[appId][indexName][searchConfigKey];
                const hitsPerPage = searchParamsRaw.hitsPerPage && searchParamsRaw.hitsPerPage.enabled ? searchParamsRaw.hitsPerPage.value : 8;
                const page = searchParamsRaw.page && searchParamsRaw.page.enabled ? searchParamsRaw.page.value : 0;
                const pageSize = hitsPerPage || 1;
                const goToPage = Math.floor((i - 1) / pageSize);
                const anchor = `#${panelKey}-${i}`;

                if (page !== goToPage) {
                    this.$store.commit(`apps/${appId}/${indexName}/setParamValue`, {configKey: searchConfigKey, key: 'page', value: goToPage});
                    this.$root.$emit('wantsToGoToAnchorAtNext', anchor);
                } else {
                    Vue.nextTick(() => {
                        goToAnchor(anchor);
                    });
                }
            },
        }
    }
</script>