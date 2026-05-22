<template>
  <div>
    <custom-select
      v-model="compositionInfo"
      class="min-w-140 border-b border-telluric-blue-opacity-60 text-solstice-blue pb-4"
      string-value-attribute="name"
      :options="compositionsWithForced"
      :refine="refine"
      :allow-free-text="effectiveAllowFreeText"
    >
      <template #icon>
        <list-icon class="block w-12 h-12 mr-8 -mt-1 fill-current" />
      </template>
      <template #default="{option, inDropDown, isSelected, highlightString}">
        <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
        <div v-html="inDropDown ? highlightString(escapeHtml(option.name)) : escapeHtml(option.name)" />
        <div
          v-if="inDropDown && option.displayName"
          class="ml-8"
          :class="isSelected ? 'text-white' : 'text-solstice-blue-opacity-50'"
        >
          | <span v-html="highlightString(escapeHtml(option.displayName))" />
        </div>
      </template>
    </custom-select>
    <p
      v-if="forbidden"
      class="text-sm text-nova-grey mt-4"
    >
      Couldn't list compositions — add the
      <code class="bg-saturn-1 text-white px-4 rounded">settings</code>
      ACL to enable the dropdown. Type a Composition ID instead.
    </p>
  </div>
</template>

<script>
    import Vue from 'vue';
    import { compositionClient } from '@algolia/composition';
    import CustomSelect from './CustomSelect.vue';
    import ListIcon from '../../icons/list.svg';
    import { escapeHtml } from '../../utils/formatters';

    export default {
        name: 'CompositionSelector',
        components: { CustomSelect, ListIcon },
        props: ['appId', 'value', 'forcedCompositions', 'allowFreeText'],
        data() {
            return {
                allCompositions: [],
                compositions: [],
                forbidden: false,
                compositionInfo: {
                    name: this.value || '',
                },
            };
        },
        computed: {
            compositionsWithForced() {
                const forced = this.forcedCompositions ? this.forcedCompositions : [];
                return [...forced, ...this.compositions];
            },
            apiKey() {
                if (!this.appId || !this.$store.state.apps[this.appId]) return null;
                return this.$store.state.apps[this.appId].key || null;
            },
            effectiveAllowFreeText() {
                return Boolean(this.allowFreeText) || this.forbidden;
            },
            compositionId() {
                return this.compositionInfo.name;
            },
        },
        watch: {
            value(val) {
                if (this.compositionInfo.name !== val) {
                    Vue.set(this.compositionInfo, 'name', val || '');
                }
            },
            appId() {
                this.forbidden = false;
                this.allCompositions = [];
                this.compositions = [];
                this.updateCompositions();
            },
            apiKey() {
                this.updateCompositions();
            },
            compositionId(val) {
                if (val !== this.value) {
                    this.$emit('input', val);
                }
            },
        },
        created() {
            this.updateCompositions();
        },
        methods: {
            refine(query) {
                if (query.length <= 0) {
                    this.compositions = this.allCompositions;
                    return;
                }
                const lower = query.toLowerCase();
                this.compositions = this.allCompositions.filter((c) => {
                    if (c.name && c.name.toLowerCase().indexOf(lower) !== -1) return true;
                    if (c.displayName && c.displayName.toLowerCase().indexOf(lower) !== -1) return true;
                    return false;
                });
            },
            async updateCompositions() {
                if (!this.appId || !this.apiKey) return;

                try {
                    const client = compositionClient(this.appId, this.apiKey);
                    const res = await client.listCompositions();
                    const items = (res && res.items) || [];
                    this.allCompositions = items.map((item) => ({
                        name: item.objectID,
                        displayName: item.name || '',
                    }));
                    this.compositions = this.allCompositions;
                    this.forbidden = false;
                } catch (err) {
                    const status = err && (err.status || (err.response && err.response.status));
                    if (status === 403) {
                        this.forbidden = true;
                    } else {
                        // eslint-disable-next-line no-console
                        console.warn('listCompositions ignored due to apiKey restrictions', err);
                    }
                    this.allCompositions = [];
                    this.compositions = [];
                }
            },
            escapeHtml,
        },
    };
</script>
