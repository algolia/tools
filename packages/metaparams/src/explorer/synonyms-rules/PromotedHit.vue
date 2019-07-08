<template>
    <div>
        <div class="flex">
            <hit-image v-if="hitOrFetched" :forcedSize="40" :panel-key="panelKey" :flatten-hit="flattenHit" display-mode="autocomplete" />
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
    import flattenRecord from 'common/utils/flattenRecordForImagePreview';
    import HitImage from "@/explorer/hits/HitImage";
    import indexMixin from "@/mixins/indexMixin";
    import {properHighlight} from "common/utils/formatters";

    export default {
        name: 'PromotedHit',
        components: {HitImage},
        props: ['panelKey', 'hit', 'id', 'position'],
        mixins: [indexMixin],
        data: function () {
            return {
                fetched: null,
            };
        },
        created: async function () {
            if (!this.hit) {
                const index = await this.getSearchIndex();
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
                    this.hitOrFetched._highlightResult[this.panelAutoTitleAttributeName] &&
                    this.hitOrFetched._highlightResult[this.panelAutoTitleAttributeName].value
                ) {
                    return this.hitOrFetched._highlightResult[this.panelAutoTitleAttributeName].value;
                }

                return this.hitOrFetched[this.panelAutoTitleAttributeName];
            }
        },
        methods: {
            flattenRecord,
            properHighlight,
        }
    }
</script>