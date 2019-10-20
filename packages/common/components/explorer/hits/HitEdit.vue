<template>
    <div>
        <div v-if="!saving">
            <ace-editor
                :id="`${uniqID}-${objectID}`"
                :styles="{ height: '250px' }"
                :default-value="newHit"
                :on-change="onChange"
                :on-validate="onValidate"
            />
            <div class="flex justify-end mt-16">
                <button
                    class="bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
                    v-if="canBeSaved"
                    @click="save"
                >
                    Save
                </button>
                <button
                    class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
                    @click="$emit('onStopEdit')"
                >
                    Cancel
                </button>
            </div>
        </div>
        <div v-if="saving" class="flex items-center justify-center text-nova-grey-opacity-80 py-48">
            <loader-icon  class="w-24 h-24 infinte-rotate" />
            <div class="ml-16">Saving {{objectID}}</div>
        </div>
    </div>
</template>

<script>
    import AceEditor from "../../editor/AceEditor";

    import LoaderIcon from 'common/icons/loader.svg'
    import {getSearchIndex} from "../../../utils/algoliaHelpers";
    import props from "../props";

    export default {
        name: 'HitEdit',
        components: {AceEditor, LoaderIcon},
        props: [
            'hit', 'allowSaveWithoutEdit',
            ...props.credentials,
        ],
        data: function () {
            const editableHit = {};
            let editableHitString = '';

            if (this.hit) {
                for (let key in this.hit) {
                    if (['_rankingInfo', '_highlightResult', '_snippetResult'].indexOf(key) === -1) {
                        editableHit[key] = JSON.parse(JSON.stringify(this.hit[key]));
                    }
                }

                editableHitString = JSON.stringify(editableHit, null, 2);
            }

            return {
                uniqID: '_' + Math.random().toString(36).substr(2, 9),
                saving: false,
                nbErrors: 0,
                oldHit: this.allowSaveWithoutEdit ? '' : editableHitString,
                newHit: editableHitString,
            }
        },
        computed: {
            objectID: function () {
                return this.hit ? this.hit.objectID : 'new objects';
            },
            canBeSaved: function () {
                return !this.saving && this.nbErrors === 0 && this.oldHit !== this.newHit;
            },
        },
        methods: {
            onChange: function (newValue) {
                this.newHit = newValue;
            },
            onValidate: function (annotations) {
                this.nbErrors = annotations.length;
            },
            save: async function () {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server);
                const hit = JSON.parse(this.newHit);
                const hits = Array.isArray(hit) ? hit : [hit];
                const task = await index.saveObjects(hits, {autoGenerateObjectIDIfNotExist: true});
                this.saving = true;
                await index.waitTask(task['taskID']);
                this.saving = false;
                this.$emit('onStopEdit');
                this.$root.$emit('shouldTriggerSearch', this.indexName);
            },
        }
    }
</script>
