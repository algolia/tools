<template>
    <div>
        <div v-if="position !== undefined">
            at pos
            <span class="text-cosmos-black-opacity-70">{{position + 1}}</span>:
        </div>
        <div class="mt-4 ml-16" v-for="(hit, i) in hitsOrFetched">
            <div class="flex">
                <hit-image
                    v-if="hit"
                    :forced-image-size="40"
                    :flatten-hit="flattenHits[i]"
                    display-mode="autocomplete"
                    v-bind="$props"
                    v-on="$listeners"
                />
                <div class="flex-grow ml-12">
                    <div v-if="hit">{{objectIDs[i]}}</div>
                    <!-- XSS Check: properHighlight removes entity decl symbols -->
                    <div v-if="!hit" class="text-cosmos-black-opacity-70" v-html="properHighlight(ids[i])"></div>
                    <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
                    <div v-if="titles[i] && titles[i] !== objectIDs[i]" v-html="escapeHtml(titles[i])"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import flattenRecord from '../../../utils/flattenRecordForImagePreview';
    import HitImage from "../hits/HitImage";
    import {properHighlight, escapeHtml} from "common/utils/formatters";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";
    import props from "../props";

    export default {
        name: 'PromotedHit',
        components: {HitImage},
        props: [
            'hit', 'ids', 'position',
            ...props.credentials,
            ...props.images,
            ...props.attributes,
        ],
        data: function () {
            return {
                fetched: null,
            };
        },
        created: function () {
            this.fetch();
        },
        watch: {
          ids: function () {
              this.fetch();
          }
        },
        computed: {
            hitsOrFetched: function () {
                return this.hit ? [this.hit] : this.fetched;
            },
            flattenHits: function () {
                return this.hitsOrFetched.map((hit) => this.flattenRecord(hit));
            },
            objectIDs: function () {
                return this.hitsOrFetched ? this.hitsOrFetched.map((h) => h.objectID) : this.ids;
            },
            titles: function () {
                return this.hitsOrFetched.map((hit) => {
                    if (!hit) return this.id;

                    const attributeName = this.titleAttributeName || this.autoTitleAttributeName;

                    if (hit._highlightResult &&
                        hit._highlightResult[attributeName] &&
                        hit._highlightResult[attributeName].value
                    ) {
                        return hit._highlightResult[attributeName].value;
                    }

                    return hit[attributeName];
                });
            }
        },
        methods: {
            flattenRecord,
            properHighlight,
            fetch: async function () {
                if (!this.hit) {
                    const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                    try {
                        this.fetched = (await index.getObjects(this.ids)).results;
                    } catch (e) {}
                }
            },
            escapeHtml,
        }
    }
</script>
