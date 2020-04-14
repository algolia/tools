<template>
    <div>
        <div class="flex">
            <hit-image
                v-if="hitOrFetched"
                :forced-image-size="40"
                :flatten-hit="flattenHit"
                display-mode="autocomplete"
                v-bind="$props"
                v-on="$listeners"
            />
            <div class="flex-grow ml-12">
                <div>
                    <span v-if="hitOrFetched">{{objectID}}</span>
                    <span v-if="!hitOrFetched" class="text-cosmos-black-opacity-70" v-html="properHighlight(id)"></span>
                    <span v-if="position !== undefined">
                        at pos
                        <span class="text-cosmos-black-opacity-70">
                            {{position}}
                        </span>
                    </span>
                </div>
                <div v-if="title && title !== objectID" v-html="title"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import flattenRecord from '../../../utils/flattenRecordForImagePreview';
    import HitImage from "../hits/HitImage";
    import {properHighlight} from "common/utils/formatters";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";
    import props from "../props";

    export default {
        name: 'PromotedHit',
        components: {HitImage},
        props: [
            'hit', 'id', 'position',
            ...props.credentials,
            ...props.images,
            ...props.attributes,
        ],
        data: function () {
            return {
                fetched: null,
            };
        },
        created: async function () {
            if (!this.hit) {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                try {
                    this.fetched = await index.getObject(this.id);
                } catch (e) {}
            }
        },
        computed: {
            hitOrFetched: function () {
                return this.hit || this.fetched;
            },
            flattenHit: function () {
                return this.flattenRecord(this.hitOrFetched);
            },
            objectID: function () {
                return this.hitOrFetched ? this.hitOrFetched.objectID : this.id;
            },
            title: function () {
                if (!this.hitOrFetched) return this.id;

                if (this.hitOrFetched._highlightResult &&
                    this.hitOrFetched._highlightResult[this.autoTitleAttributeName] &&
                    this.hitOrFetched._highlightResult[this.autoTitleAttributeName].value
                ) {
                    return this.hitOrFetched._highlightResult[this.autoTitleAttributeName].value;
                }

                return this.hitOrFetched[this.autoTitleAttributeName];
            }
        },
        methods: {
            flattenRecord,
            properHighlight,
        }
    }
</script>
