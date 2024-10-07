<template>
    <div
        class="flex items-center text-solstice-blue"
        :class="deletingIndex ? 'mr-24': ''">
        <button
            @click="enableCreatingNewIndex()"
            class="cursor-pointer ml-8 flex items-center text-solstice-blue relative group"
        >
            <trash-icon class="w-16 h-16 text-solstice-blue"/>
            <tooltip>Delete the index. Will ask for confirmation.</tooltip>
        </button>
        <input
            ref="input"
            v-if="deletingIndex && !pendingDeletion"
            v-model="indexNameToDelete"
            @keyup.esc="deletingIndex = false; indexNameToDelete = ''"
            placeholder="To delete type the index name"
            class="px-8 ml-8 w-200 bg-moon-grey p-4 rounded text-solstice-blue"
        />
        <button
            v-if="deletingIndex && !pendingDeletion"
            class="cursor-pointer ml-8 px-8 py-4 border border-telluric-blue-opacity-60 rounded text-solstice-blue text-sm"
            @click="deletingIndex = false; indexNameToDelete = ''"
        >
            Cancel
        </button>
        <button
            v-if="deletingIndex && !pendingDeletion && indexNameToDelete === panelIndexName"
            class="cursor-pointer bg-mars-1 ml-8 px-8 py-4 border border-white rounded text-white text-sm"
            @click="deleteIndex()"
        >
            I want to delete the index: {{indexNameToDelete}}
        </button>
        <div v-if="pendingDeletion" class="ml-8 flex items-center">
            <loader-icon  class="w-12 h-12 infinte-rotate" />
            <div class="pl-4">Deleting {{indexNameToDelete}}</div>
        </div>
    </div>
</template>

<script>
    import TrashIcon from "common/icons/trash.svg";
    import LoaderIcon from 'common/icons/loader.svg'
    import {getClient} from 'common/utils/algoliaHelpers';

    import panelsMixin from "common/mixins/panelsMixin";
    import Vue from 'vue';
    import Tooltip from "common/components/Tooltip.vue";

    export default {
        name: 'IndexDelete',
        components: {Tooltip, TrashIcon, LoaderIcon},
        mixins: [panelsMixin],
        props: ['panelKey'],
        data: function () {
            return {
                deletingIndex: false,
                indexNameToDelete: '',
                pendingDeletion: false,
            }
        },
        methods: {
            deleteIndex: async function () {
                if (this.panelIndexName !== this.indexNameToDelete) return;

                const client = await getClient(this.panelAppId, this.panelAdminAPIKey, this.panelServer, this.panelUserId);
                const index = client.customInitIndex(this.indexNameToDelete);
                const res = await index.delete();
                this.pendingDeletion = true;
                await index.waitTask(res.taskID);
                this.pendingDeletion = false;
                this.deletingIndex = false;
                const indexes = await client.listIndices({
                    queryParameters: {
                        page: 0
                    }
                });
                let newCurrentIndexName = indexes.items.length > 0 ? indexes.items[0].name : null;

                const otherPanelKey = this.panelKey === 'leftPanel' ? 'rightPanel': 'leftPanel';
                const otherPanelAppId = this.$store.state.panels[otherPanelKey].appId;
                const otherPanelIndexName = this.$store.state.panels[otherPanelKey].indexName;
                if (otherPanelAppId === this.panelAppId && otherPanelIndexName !== this.indexNameToDelete) {
                    newCurrentIndexName = otherPanelIndexName;
                }

                this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {
                    appId: this.panelAppId,
                    indexName: newCurrentIndexName,
                });

                this.indexNameToDelete = '';
            },
            enableCreatingNewIndex: function () {
                this.deletingIndex = true;
                Vue.nextTick(() => {
                    const input = this.$refs.input;
                    this.$refs.input.focus();
                    input.setSelectionRange(0, input.value.length);
                });
            }
        }
    }
</script>
