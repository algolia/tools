<template>
    <div
        class="flex items-center text-solstice-blue"
        :class="wantRename ? 'mr-24': ''">
        <button
            @click="enableRenameIndex()"
            class="cursor-pointer ml-8 flex items-center text-solstice-blue relative group"
        >
            <edit3-icon class="w-16 h-16 text-solstice-blue" />
            <tooltip>Rename an index. Will ask for the new name</tooltip>
        </button>
        <input
            ref="input"
            v-if="wantRename && !pendingRename"
            v-model="newIndexName"
            @keyup.enter="renameIndex()"
            @keyup.enter.prevent
            @keyup.esc="wantRename = false"
            placeholder="new_index_name"
            class="px-8 ml-8 w-128 bg-moon-grey p-4 rounded text-solstice-blue"
        />
        <button
            v-if="wantRename && !pendingRename"
            class="cursor-pointer ml-8 px-8 py-4 border border-telluric-blue-opacity-60 rounded text-solstice-blue text-sm"
            @click="wantRename = false"
        >
            Cancel
        </button>
        <button
            v-if="wantRename && !pendingRename && newIndexName.length > 0 && newIndexName !== indexName"
            class="cursor-pointer ml-8 px-8 py-4 border border-telluric-blue-opacity-60 rounded text-solstice-blue text-sm"
            @click="renameIndex()"
        >
            Rename
        </button>
        <div v-if="pendingRename" class="ml-8 flex items-center">
            <loader-icon  class="w-12 h-12 infinte-rotate" />
            <div class="pl-4">Renaming {{indexName}}</div>
        </div>
    </div>
</template>

<script>
    import LoaderIcon from 'common/icons/loader.svg'
    import Edit3Icon from 'common/icons/edit3.svg'
    import {getClient} from 'common/utils/algoliaHelpers';

    import Vue from 'vue';
    import Tooltip from "common/components/Tooltip.vue";
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'IndexRename',
        components: {Tooltip, LoaderIcon, Edit3Icon},
        mixins: [panelsMixin],
        props: ['appId', 'apiKey', 'indexName'],
        data: function () {
            return {
                wantRename: false,
                newIndexName: '',
                pendingRename: false,
            }
        },
        methods: {
            renameIndex: async function () {
                const client = await getClient(this.appId, this.apiKey);
                const res = client.moveIndex(this.indexName, this.newIndexName);
                this.pendingRename = true;
                await res.wait();
                this.pendingRename = false;
                this.wantRename = false;
                this.$emit('onIndexRenamed', this.newIndexName);
                this.newIndexName = '';
            },
            enableRenameIndex: function () {
                this.wantRename = true;
                Vue.nextTick(() => {
                    const input = this.$refs.input;
                    this.$refs.input.focus();
                    input.setSelectionRange(0, input.value.length);
                });
            }
        }
    }
</script>
