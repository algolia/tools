<template>
    <div
        class="flex items-center text-solstice-blue"
        :class="creatingNewIndex ? 'mr-24': ''">
        <button
            @click="enableCreatingNewIndex()"
            class="cursor-pointer ml-8 flex items-center text-solstice-blue relative group"
        >
            <plus-circle-icon class="w-16 h-16 text-solstice-blue" />
            <tooltip>Create an index. Will ask for the name</tooltip>
        </button>
        <input
            ref="input"
            v-if="creatingNewIndex && !pendingCreation"
            v-model="newIndexName"
            @keyup.enter="createIndex()"
            @keyup.enter.prevent
            @keyup.esc="creatingNewIndex = false"
            placeholder="new_index_name"
            class="px-8 ml-8 w-128 bg-moon-grey p-4 rounded text-solstice-blue"
        />
        <button
            v-if="creatingNewIndex && !pendingCreation"
            class="cursor-pointer ml-8 px-8 py-4 border border-telluric-blue-opacity-60 rounded text-solstice-blue text-sm"
            @click="creatingNewIndex = false"
        >
            Cancel
        </button>
        <button
            v-if="creatingNewIndex && !pendingCreation && newIndexName.length > 0"
            class="cursor-pointer ml-8 px-8 py-4 border border-telluric-blue-opacity-60 rounded text-solstice-blue text-sm"
            @click="createIndex()"
        >
            Create
        </button>
        <div v-if="pendingCreation" class="ml-8 flex items-center">
            <loader-icon  class="w-12 h-12 infinte-rotate" />
            <div class="pl-4">Creating {{newIndexName}}</div>
        </div>
    </div>
</template>

<script>
    import PlusCircleIcon from "common/icons/plus-circle.svg";
    import LoaderIcon from 'common/icons/loader.svg'
    import {getClient} from 'common/utils/algoliaHelpers';

    import Vue from 'vue';
    import Tooltip from "common/components/Tooltip";
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'NewIndex',
        components: {Tooltip, PlusCircleIcon, LoaderIcon},
        mixins: [panelsMixin],
        props: ['panelKey'],
        data: function () {
            return {
                creatingNewIndex: false,
                newIndexName: '',
                pendingCreation: false,
            }
        },
        methods: {
            createIndex: async function () {
                const client = await getClient(this.panelAppId, this.panelAdminAPIKey);
                const res = client.customInitIndex(this.newIndexName).setSettings({});
                this.pendingCreation = true;
                await res.wait();
                this.pendingCreation = false;
                this.creatingNewIndex = false;
                this.$store.commit(`panels/${this.panelKey}/setPanelConfig`, {
                    appId: this.panelAppId,
                    indexName: this.newIndexName,
                });
                this.newIndexName = '';
            },
            enableCreatingNewIndex: function () {
                this.creatingNewIndex = true;
                Vue.nextTick(() => {
                    const input = this.$refs.input;
                    this.$refs.input.focus();
                    input.setSelectionRange(0, input.value.length);
                });
            }
        }
    }
</script>
