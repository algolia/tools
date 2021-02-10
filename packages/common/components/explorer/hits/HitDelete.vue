<template>
    <div>
        <div v-if="!saving" class="flex justify-end mt-16">
            <button
                @click="deleteHit"
                class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8"
            >
                Confirm Delete
            </button>
            <button
                @click="$emit('onStopDelete')"
                class="white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 ml-16"
            >
                Cancel
            </button>
        </div>
        <div v-if="saving" class="flex items-center justify-center text-nova-grey-opacity-80 py-16">
            <loader-icon  class="w-24 h-24 infinte-rotate" />
            <div class="ml-16">Deleting {{hit.objectID}}</div>
        </div>
    </div>
</template>

<script>
    import LoaderIcon from 'common/icons/loader.svg'
    import {getSearchIndex} from "../../../utils/algoliaHelpers";
    import props from "../props";

    export default {
        name: 'HitDelete',
        props: ['hit', ...props.credentials],
        components: {LoaderIcon},
        data: function () {
            return {
                saving: false,
            }
        },
        methods: {
            deleteHit: async function () {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                const task = await index.deleteObject(this.hit.objectID);
                this.saving = true;
                await index.waitTask(task['taskID']);
                this.saving = false;
                this.$emit('onStopDelete');
                this.$root.$emit('shouldTriggerSearch', this.indexName);
            }
        },
    }
</script>
