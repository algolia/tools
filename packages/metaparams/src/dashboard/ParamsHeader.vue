<template>
    <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-proton-grey bg-white p-8 bg-proton-grey-opacity-40"
         :class="configKey === 'indexSettings' ? 'border-t' : ''">
        <div class="mr-auto">{{ configKey !== 'indexSettings' ? 'Search Params': 'Index Settings'}}</div>
        <button class="relative group">
            <history-icon
                v-if="configKey === 'indexSettings' && isIndexSettingsDirty"
                class="ml-8 cursor-pointer text-solstice-blue"
                @click="$store.commit(`${indexCommitPrefix}/resetIndexSettings`)"
                :class="`flex-grow-0 w-12 h-12 flex-shrink-0 block`"
            />
            <tooltip :position="panelKey === 'leftPanel' ? 'center' : 'right'">
                Cancel all changes
            </tooltip>
        </button>
        <button class="relative group">
            <flip-right-icon
                class="ml-8 cursor-pointer text-solstice-blue"
                v-if="panelKey === 'leftPanel' && paramsCamJump"
                @click="$store.commit('panels/jumpParams', {panelKey, configKey})"
                :class="`flex-grow-0 w-12 h-12 flex-shrink-0 block`"
            />
            <tooltip :position="panelKey === 'leftPanel' ? 'center' : 'right'">
                Apply all {{ configKey !== 'indexSettings' ? 'search params': 'index settings'}} in the right panel index.
            </tooltip>
        </button>
        <button class="relative group">
            <copy-icon
                class="ml-8 cursor-pointer text-solstice-blue"
                @click="copyToClipboard"
                :class="`flex-grow-0 w-12 h-12 flex-shrink-0 block`"
            />
            <tooltip :position="panelKey === 'leftPanel' ? 'center' : 'right'">
                Copy to clipboard
            </tooltip>
        </button>
        <button class="relative group">
            <flip-left-icon
                class="ml-8 cursor-pointer text-solstice-blue"
                v-if="panelKey === 'rightPanel' && paramsCamJump"
                @click="$store.commit('panels/jumpParams', {panelKey, configKey})"
                :class="`flex-grow-0 w-12 h-12 flex-shrink-0 block`"
            />
            <tooltip :position="panelKey === 'leftPanel' ? 'center' : 'right'">
                Apply all {{ configKey !== 'indexSettings' ? 'search params': 'index settings'}} in the left panel index.
            </tooltip>
        </button>
        <button class="relative group">
            <trash-icon
                class="ml-8 cursor-pointer text-solstice-blue"
                v-if="keys.length > 0"
                @click="$store.commit('panels/clearParams', {panelKey, configKey})"
                :class="`flex-grow-0 w-12 h-12 flex-shrink-0 block`"
            />
            <tooltip :position="panelKey === 'leftPanel' ? 'center' : 'right'">
                {{ configKey !== 'indexSettings' ? 'Remove': 'Delete'}}
                every {{ configKey !== 'indexSettings' ? 'search params': 'index settings'}}
                {{ configKey !== 'indexSettings' ? '': '. Will ask for confirmation'}}
            </tooltip>
        </button>
        <button class="relative group">
            <chevron-down-icon
                class="text-telluric-blue ml-24 w-8 h-8 cursor-pointer"
                @click="$emit('onSetOpen', !open)"
                :class="`flex-grow-0 w-8 h-8 flex-shrink-0 block ${open ? '' : 'rotate-180'}`"
            />
        </button>
    </div>
</template>

<script>
    import ChevronDownIcon from "common/icons/chevron-down.svg";
    import TrashIcon from "common/icons/trash.svg";
    import CopyIcon from "common/icons/copy.svg";
    import HistoryIcon from "common/icons/history.svg";
    import FlipLeftIcon from "common/icons/flip-left.svg";
    import FlipRightIcon from "common/icons/flip-right.svg";
    import Tooltip from "common/components/Tooltip.vue";
    import panelsMixin from "common/mixins/panelsMixin";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import {algoliaParams} from "common/utils/algoliaHelpers";
    import copyToClipboard from 'copy-to-clipboard';

    export default {
        name: 'ParamsHeader',
        props: ['panelKey', 'configKey', 'keys', 'open'],
        mixins: [panelsMixin, indexInfoMixin],
        components: {Tooltip, ChevronDownIcon, CopyIcon, TrashIcon, FlipLeftIcon, FlipRightIcon, HistoryIcon},
        computed: {
            appId: function () { // Needed for indexInfoMixin
                return this.panelAppId;
            },
            indexName: function () { // Needed for indexInfoMixin
                return this.panelIndexName;
            },
            paramsCamJump: function () {
                return this.$store.state.panels.splitMode
                    && this.keys.length > 0
                    && (this.configKey !== 'indexSettings' || !this.sameIndexOnEachPanel);
            }
        },
        methods: {
            copyToClipboard: function () {
                const params = algoliaParams(this.indexData[this.configKey]);
                copyToClipboard(JSON.stringify(params, null, 2));
            }
        }
    }
</script>
