<template>
    <div
        class="flex items-center text-solstice-blue"
        :class="clearingIndex ? 'mr-24': ''">
        <button
            @click="enableCreatingNewIndex()"
            class="cursor-pointer ml-8 flex items-center text-solstice-blue relative group"
        >
            <delete-icon class="w-16 h-16 text-solstice-blue"/>
            <tooltip>Clear the index. Will ask for confirmation.</tooltip>
        </button>
        <input
            ref="input"
            v-if="clearingIndex && !pendingClearing"
            v-model="indexNameToClear"
            @keyup.esc="clearingIndex = false; indexNameToClear = ''"
            placeholder="To clear type the index name"
            class="px-8 ml-8 w-200 bg-moon-grey p-4 rounded text-solstice-blue"
        />
        <button
            v-if="clearingIndex && !pendingClearing"
            class="cursor-pointer ml-8 px-8 py-4 border border-telluric-blue-opacity-60 rounded text-solstice-blue text-sm"
            @click="clearingIndex = false; indexNameToClear = ''"
        >
            Cancel
        </button>
        <button
            v-if="clearingIndex && !pendingClearing && indexNameToClear === panelIndexName"
            class="cursor-pointer bg-mars-1 ml-8 px-8 py-4 border border-white rounded text-white text-sm"
            @click="clearIndex()"
        >
            I want to clear the index: {{indexNameToClear}}
        </button>
        <div v-if="pendingClearing" class="ml-8 flex items-center">
            <loader-icon  class="w-12 h-12 infinte-rotate" />
            <div class="pl-4">Clearing {{indexNameToClear}}</div>
        </div>
    </div>
</template>

<script>
    import DeleteIcon from "common/icons/delete.svg";
    import LoaderIcon from 'common/icons/loader.svg'
    import {getClient} from 'common/utils/algoliaHelpers';

    import panelsMixin from "common/mixins/panelsMixin";
    import Vue from 'vue';
    import Tooltip from "common/components/Tooltip.vue";

    export default {
        name: 'IndexClear',
        components: {Tooltip, DeleteIcon, LoaderIcon},
        mixins: [panelsMixin],
        props: ['panelKey'],
        data: function () {
            return {
                clearingIndex: false,
                indexNameToClear: '',
                pendingClearing: false,
            }
        },
        methods: {
            clearIndex: async function () {
                if (this.panelIndexName !== this.indexNameToClear) return;

                const client = await getClient(this.panelAppId, this.panelAdminAPIKey, this.panelServer, this.panelUserId);
                const index = client.customInitIndex(this.indexNameToClear);
                const res = await index.clearObjects();
                this.pendingClearing = true;
                await index.waitTask(res.taskID);
                this.pendingClearing = false;
                this.clearingIndex = false;

                this.$root.$emit('shouldTriggerSearch', this.panelIndexName);
                this.indexNameToClear = '';
            },
            enableCreatingNewIndex: function () {
                this.clearingIndex = true;
                Vue.nextTick(() => {
                    const input = this.$refs.input;
                    this.$refs.input.focus();
                    input.setSelectionRange(0, input.value.length);
                });
            }
        }
    }
</script>
