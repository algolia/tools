<template>
    <div v-if="enabled && leftHits && rightHits" class="mt-16">
        <div class="text-solstice-blue-opacity-80">
            <div class="font-bold">
                Nb of points : <input type="number" v-model="analyseMaxNbPoints" min="1" style="width: 50px;"/>
            </div>
            <div class="font-bold mt-12 mb-4">
                Tracked objectIDs/facetFilters:
            </div>
            <tracked-elements
                v-model="trackedObjectIDs"
                :left-positions="leftTrackedPositions"
                :right-positions="rightTrackedPositions"
                @onClickLeft="goToHit($event + 1, 'leftPanel')"
                @onClickRight="goToHit($event + 1, 'rightPanel')"
            />
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
                        v-if="leftInOther[i] !== -1 && $store.state.panels.splitMode"
                        :x1="circleX"
                        :y1="spaceBetweenCircle * i + 36"
                        :x2="width - circleX"
                        :y2="spaceBetweenCircle * leftInOther[i] + 36"
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
                            :fill="hitColor(true, i)"
                            :stroke="personalized(hit) ? circleStrokeColorPerso : 'gray'"
                            stroke-width="2"
                        />
                        <text :x="circleX - textMargin" :y="spaceBetweenCircle * i + 40" font-size="12" fill="gray" text-anchor="end">
                            {{i + 1}}
                        </text>
                        <g v-if="leftHitsTracked[i] !== -1">
                            <line
                                :x1="circleX - textMargin - 35" :y1="spaceBetweenCircle * i + 36"
                                :x2="circleX - textMargin - 25" :y2="spaceBetweenCircle * i + 36"
                                stroke="gray" stroke-width="2" marker-end="url(#arrowhead)"
                            />
                            <text :x="circleX - textMargin - 40" :y="spaceBetweenCircle * i + 38" font-size="12" fill="gray" text-anchor="end">
                                {{String.fromCharCode(97 + leftHitsTracked[i])}}.
                            </text>
                        </g>
                    </g>
                </g>
                <template v-if="$store.state.panels.splitMode">
                    <g class="cursor-pointer" v-for="(hit, i) in rightHits" @click="goToHit(i + 1, 'rightPanel')">
                        <circle
                            :r="radius"
                            :cx="width - circleX"
                            :cy="spaceBetweenCircle * i + 36"
                            :fill="hitColor(false, i)"
                            :stroke="personalized(hit) ? circleStrokeColorPerso : 'gray'"
                            stroke-width="2"
                        />
                        <text :x="width - circleX + textMargin" :y="spaceBetweenCircle * i + 40" font-size="12" fill="gray"
                              text-anchor="start">{{i + 1}}
                        </text>
                        <g v-if="rightHitsTracked[i] !== -1">
                            <line
                                :x1="width - circleX + textMargin + 35" :y1="spaceBetweenCircle * i + 36"
                                :x2="width - circleX + textMargin + 25" :y2="spaceBetweenCircle * i + 36"
                                stroke="gray" stroke-width="2" marker-end="url(#arrowhead)"
                            />
                            <text :x="width - circleX + textMargin + 40" :y="spaceBetweenCircle * i + 38" font-size="12" fill="gray" text-anchor="start">
                                {{String.fromCharCode(97 + rightHitsTracked[i])}}.
                            </text>
                        </g>
                    </g>
                </template>
            </svg>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import {goToAnchor} from "common/utils/domHelpers";
    import panelsMixin from "common/mixins/panelsMixin";
    import TrackedElements from "./TrackedElements";

    export default {
        name: 'CompareHits',
        components: {TrackedElements},
        mixins: [panelsMixin],
        props: ['enabled'],
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
                leftResponse: null,
                rightResponse: null,
                leftTrackedPositions: [],
                rightTrackedPositions: [],
                leftHitsTracked: [],
                rightHitsTracked: [],
                leftInOther: [],
                rightInOther: [],
            }
        },
        created: function () {
            this.$root.$on('leftPanelUpdateAnalyseResponse', (response) => {
                this.leftResponse = response;
                this.compute();
            });
            this.$root.$on('rightPanelUpdateAnalyseResponse', (response) => {
                this.rightResponse = response;
                this.compute();
            });
        },
        watch: {
            trackedObjectIDs: function () {
                this.compute();
            }
        },
        computed: {
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
            compute: function () {
                const leftOnOther = this.leftHits.map(() => -1);
                const rightOnOther = this.rightHits.map(() => -1);

                ['left', 'right'].forEach((panel) => {
                    const trackedPositions = this.trackedObjectIDs.map(() => -1);
                    const hits = panel === 'left' ? this.leftHits : this.rightHits;
                    const otherHits = panel === 'left' ? this.rightHits : this.leftHits;
                    const hitsTracked = hits.map(() => -1);

                    for (let i = 0; i < hits.length; i++) {
                        if (panel === 'left') {
                            leftOnOther[i] = otherHits.findIndex((hit) => hit.objectID === hits[i].objectID);
                            if (leftOnOther[i] !== -1) rightOnOther[leftOnOther[i]] = i;
                        }

                        this.trackedObjectIDs.forEach((needle, needleIndex) => {
                            const parts = needle.split(':');

                            const facetName = parts[0];
                            const facetValue = parts.length > 1 ? parts[1] : '';

                            if (hits[i].objectID === needle || (parts.length > 1 && hits[i][facetName] == facetValue)) {
                                if (hitsTracked[i] === -1) hitsTracked[i] = needleIndex;
                                if (trackedPositions[needleIndex] === -1) trackedPositions[needleIndex] = i;
                            }
                        });
                    }

                    this[`${panel}TrackedPositions`] = trackedPositions;
                    this[`${panel}HitsTracked`] = hitsTracked;
                });

                this.leftInOther = leftOnOther;
                this.rightInOther = rightOnOther;
            },
            personalized(hit) {
                return hit._rankingInfo && hit._rankingInfo.personalization && hit._rankingInfo.personalization.filtersScore > 0;
            },
            hitColor: function (isLeft, hitPos) {
                if (isLeft) {
                    if (!this.$store.state.panels.splitMode || this.leftInOther[hitPos] !== -1) {
                        return this.circleFilledColor;
                    }
                    return 'white';
                }

                if (this.rightInOther[hitPos] !== -1) {
                    return this.circleFilledColor;
                }
                return 'white';
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