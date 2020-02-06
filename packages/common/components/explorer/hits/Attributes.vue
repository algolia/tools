<template>
    <div>
        <div :key="key" v-for="key in currentKeys" class="flex">
            <div :title="key" class="w-128 min-w-128 mr-16 text-right json-token key truncate">
                {{key}}:
            </div>
            <attribute style="width: calc(100% - 128px)" :item="item[key]"  />
        </div>
        <div class="w-128 min-w-128 mr-16 text-right text-nebula-blue cursor-pointer" v-if="needsCollapse && nbExtraAttributes > 0" @click="isCollapsed = !isCollapsed">
            <span v-if="isCollapsed">Show {{nbExtraAttributes}} more</span>
            <span v-if="!isCollapsed">Show {{nbExtraAttributes}} less</span>
        </div>
    </div>
</template>

<script>
    import Attribute from "./Attribute";
    import props from "../props";

    export default {
        name: 'Attributes',
        components: {Attribute},
        props: [
            'topAttributes', 'searchableAttributes', 'item',
            ...props.attributes,
            ...props.paramsAndSettings,
        ],
        data: function () {
            return {
                isCollapsed: true,
                reservedAttributes: {
                    _highlightResult: true,
                    _snippetResult: true,
                    _rankingInfo: true,
                    _distinctSeqID: true
                }
            }
        },
        computed: {
            nbExtraAttributes: function () {
                return this.allKeys.length - this.keys.length;
            },
            needsCollapse: function () {
                return this.topAttributes.length > 0;
            },
            uncollapsedAttributes: function () {
                const hasAttributesToRetrieve = this.searchParams && this.searchParams.attributesToRetrieve;

                if (!hasAttributesToRetrieve && this.showSearchableAttributes && this.showOnlyMatchingAttributes) {
                    return this.keys.filter((key) => {
                        if (key === 'objectID') return true;
                        if (this.searchableAttributes.indexOf(key) !== -1) return this.item[key]._b_;
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
                return Object.keys(this.item).filter((key) => {
                    return !this.reservedAttributes[key] || (this.searchParams.getRankingInfo === true && key === '_rankingInfo');
                }).sort((a, b) => {
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
