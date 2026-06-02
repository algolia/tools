<template>
  <div>
    <autocomplete
      ref="autocomplete"
      :items="items"
      :refine="refine"
      :value="value"
      :display-empty-query="displayEmptyQuery"
      :empty-search-for-query-equals-value="true"
      v-on="$listeners"
    >
      <template #item="{ index, item }">
        <slot
          :index="index"
          :item="item"
        >
          <div>
            <span
              v-for="(part, partIndex) in highlightParts(item)"
              :key="partIndex"
              :class="{ 'font-bold': part.highlighted }"
            >
              {{ part.value }}
            </span>
          </div>
        </slot>
      </template>
    </autocomplete>
  </div>
</template>

<script>
import Autocomplete from "./Autocomplete.vue";
import algoliasearch from "algoliasearch";

export default {
    name: 'AlgoliaAutocomplete',
    components: {Autocomplete},
    props: {
        indexName: {
            type: String,
            default: '',
        },
        searchParams: {
            type: Object,
            default: function () {
                return {};
            },
        },
        displayAttributeName: {
            type: String,
            default: '',
        },
        value: {
            type: [String, Number, Object],
            default: '',
        },
        displayEmptyQuery: {
            type: Boolean,
            default: false,
        },
        appId: {
            type: String,
            default: '',
        },
        apiKey: {
            type: String,
            default: '',
        },
        localItems: {
            type: Array,
            default: function () {
                return [];
            },
        },
    },
    data: function () {
        return {
            items: [],
            refineRequestId: 0,
        }
    },
    computed: {
        algoliaIndex: function () {
            return algoliasearch(this.appId, this.apiKey).initIndex(this.indexName)
        }
    },
    created: function () {
        this.refine('');
    },
    methods: {
        localRefine: function (query) {
            const normalizedQuery = (query || '').toLowerCase();
            if (!normalizedQuery && !this.displayEmptyQuery) return [];
            const hitsPerPage = ((this.searchParams || {}).hitsPerPage || 20);
            return (this.localItems || []).filter((item) => {
                const value = item[this.displayAttributeName] || item.name || item.param_name || '';
                return value.toLowerCase().includes(normalizedQuery);
            }).sort((a, b) => {
                const aValue = (a[this.displayAttributeName] || a.name || a.param_name || '').toLowerCase();
                const bValue = (b[this.displayAttributeName] || b.name || b.param_name || '').toLowerCase();
                const aStartsWith = aValue.startsWith(normalizedQuery);
                const bStartsWith = bValue.startsWith(normalizedQuery);
                if (aStartsWith !== bStartsWith) return aStartsWith ? -1 : 1;
                if (aValue.length !== bValue.length) return aValue.length - bValue.length;
                return aValue.localeCompare(bValue);
            }).slice(0, hitsPerPage);
        },
        itemKey: function (item) {
            return item.param_name || item.name || item[this.displayAttributeName];
        },
        mergeItems: function (localItems, remoteItems) {
            const keys = new Set();
            return [...localItems, ...remoteItems].filter((item) => {
                const key = this.itemKey(item);
                if (keys.has(key)) return false;
                keys.add(key);
                return true;
            });
        },
        highlightParts: function (item) {
            const highlightedValue = item._highlightResult &&
                item._highlightResult[this.displayAttributeName] &&
                item._highlightResult[this.displayAttributeName].value;
            const value = highlightedValue || item[this.displayAttributeName] || '';
            return String(value)
                .split(/(<\/?em>)/)
                .reduce((parts, part) => {
                    const lastPart = parts[parts.length - 1];
                    if (part === '<em>') {
                        parts.push({value: '', highlighted: true});
                    } else if (part === '</em>') {
                        parts.push({value: '', highlighted: false});
                    } else if (part) {
                        if (lastPart) {
                            lastPart.value += part;
                        } else {
                            parts.push({value: part, highlighted: false});
                        }
                    }
                    return parts;
                }, [{value: '', highlighted: false}])
                .filter((part) => part.value);
        },
        refine: async function (query) {
            const requestId = ++this.refineRequestId;
            const localItems = this.localRefine(query);
            this.items = localItems;
            try {
                const data = await this.algoliaIndex.search(query, this.searchParams || {});
                if (requestId !== this.refineRequestId) return;
                this.items = this.mergeItems(localItems, data.hits);
            } catch (e) {
                if (requestId !== this.refineRequestId) return;
                this.items = localItems;
            }
        },
    },
}
</script>
