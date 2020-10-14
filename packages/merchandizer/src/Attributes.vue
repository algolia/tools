<template>
    <div>
        <div :key="key" v-for="key in currentKeys">
            <attribute :attribute-name="key" :hit="hit" />
        </div>
        <div
            v-if="needsCollapse && nbExtraAttributes > 0"
            @click="isCollapsed = !isCollapsed"
            class="mr-16 text-nebula-blue cursor-pointer"
        >
            <span v-if="isCollapsed">Show {{nbExtraAttributes}} more</span>
            <span v-if="!isCollapsed">Show {{nbExtraAttributes}} less</span>
        </div>
    </div>
</template>

<script>
    import Attribute from "./Attribute";

    export default {
        name: 'Attributes',
        components: {Attribute},
        props: [
            'topAttributes', 'attributes', 'hit', 'noCollapse',
        ],
        data: function () {
            return {
                isCollapsed: true,
                reservedAttributes: {
                    _highlightResult: true,
                    _snippetResult: true,
                    _rankingInfo: true,
                    _distinctSeqID: true,
                    __style__: true,
                    __i__: true,
                }
            }
        },
        computed: {
            nbExtraAttributes: function () {
                return this.allKeys.length - this.keys.length;
            },
            needsCollapse: function () {
                return this.noCollapse !== true && this.topAttributes.length > 0;
            },
            uncollapsedAttributes: function () {
                const hasAttributesToRetrieve = this.searchParams && this.searchParams.attributesToRetrieve;

                if (!hasAttributesToRetrieve && this.showSearchableAttributes && this.showOnlyMatchingAttributes) {
                    return this.keys.filter((key) => {
                        if (key === 'objectID') return true;
                        if (this.searchableAttributes.indexOf(key) !== -1) return this.hit[key]._b_;
                        return true;
                    });
                }

                return this.keys;
            },
            currentKeys: function () {
                return this.needsCollapse && this.isCollapsed ? this.uncollapsedAttributes : this.allKeys;
            },
            keys: function () {
                return this.allKeys.filter((key) => { return this.topAttributes.indexOf(key) !== -1 })
            },
            allKeys: function () {
                const getRankingInfo = this.searchParams && this.searchParams.getRankingInfo === true;

                return Object.keys(this.hit).filter((key) => {
                    return !this.reservedAttributes[key] || (getRankingInfo === true && key === '_rankingInfo');
                }).sort((a, b) => {
                    if (a === 'objectID') return -1;
                    if (b === 'objectID') return 1;

                    const indexA = this.topAttributes.indexOf(a);
                    const indexB = this.topAttributes.indexOf(b);

                    if (indexA === indexB) { return 0; }
                    if (indexA === -1) { return 1 }
                    if (indexB === -1) { return -1 }
                    if (indexA < indexB) { return -1 }

                    return 1;
                });
            }
        }
    }

</script>
