<template>
    <div>
        <div v-if="!saving">
            <div class="flex items-center">
                <div class="w-20p p-8">
                    <input
                        v-model="newObjectID"
                        v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                        class="input-custom mb-8"/>
                </div>
                <div class="w-80p p-8 flex items-center">
                    <div>
                        <div>
                            <select v-model="newType" class="text-sm mb-8">
                                <option value="synonym">2-way</option>
                                <option value="onewaysynonym">1-way</option>
                                <option value="altcorrection1">correction1</option>
                                <option value="altcorrection2">correction2</option>
                                <option value="placeholder">placeholder</option>
                            </select>
                        </div>
                    </div>
                    <div class="ml-8 flex flex-wrap items-center">
                        <div>
                            <input
                                :placeholder="newType === 'placeholder' ? '<identifier>' : ''"
                                v-model="newInput" class="input-custom mb-8"
                                v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                            />
                        </div>
                        <div class="mx-8 mb-8 text-sm">{{ newType === 'synonym' ? '<=>' : '=>'}}</div>
                        <div v-for="(s, i) in newSynonyms" class="flex">
                            <div>
                                <input
                                    :ref="i"
                                    v-model="newSynonyms[i]"
                                    class="input-custom mb-8"
                                    v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                    @keydown="onKeyDown($event, i)"
                                />
                            </div>
                            <div v-if="i < newSynonyms.length - 1" class="mx-8 mb-8 w-full text-center text-sm">
                                {{newType === 'synonym' ? '<=>' : 'OR'}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
            <div class="ml-16">Saving {{newObjectID}}</div>
        </div>
    </div>
</template>

<script>
    import VueInputAutowidth from 'vue-input-autowidth';
    import LoaderIcon from 'common/icons/loader.svg'
    import synonymMixin from "./synonymMixin";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";
    import props from "../props";

    export default {
        name: 'SynonymEdit',
        components: {LoaderIcon},
        mixins: [synonymMixin],
        props: [
            'synonym', 'allowSaveWithoutEdit',
            ...props.credentials,
        ],
        directives: {
            autowidth: VueInputAutowidth,
        },
        data: function () {
            return {
                saving: false,
                newObjectID: '',
                newType: 'synonym',
                newInput: '',
                newSynonyms: [],
                forwardToReplicas: true,
            }
        },
        created: function () {
            this.newObjectID = JSON.parse(JSON.stringify(this.synonym.objectID));
            this.newType = JSON.parse(JSON.stringify(this.type));
            this.newInput = JSON.parse(JSON.stringify(this.input));
            this.newSynonyms = JSON.parse(JSON.stringify(this.synonyms));
        },
        computed: {
            canBeSaved: function () {
                // valid
                if (this.newObjectID.length <= 0) return false;
                if (this.newInput.length <= 0) return false;
                const newSynonyms = this.newSynonyms.filter((s) => {return s.length > 0});
                if (newSynonyms.length <= 0) return false;

                if (this.allowSaveWithoutEdit) return true;

                // not same
                if (this.newObjectID !== this.synonym.objectID) return true;
                if (this.newType !== this.type) return true;
                if (this.newInput !== this.input) return true;
                if (JSON.stringify(newSynonyms) !== JSON.stringify(this.synonyms)) return true;

                return false;
            },
        },
        methods: {
            getNewSynonym: function () {
                const synonym = {
                    objectID: this.newObjectID,
                    type: this.newType,
                };

                if (synonym.type === 'synonym') {
                    synonym.synonyms = [this.newInput, ...this.newSynonyms].filter((s) => {return s.length > 0});
                } else if (synonym.type === 'onewaysynonym') {
                    synonym.input = this.newInput;
                    synonym.synonyms = this.newSynonyms;
                } else if (synonym.type === 'altcorrection1' || synonym.type === 'altcorrection2') {
                    synonym.word = this.newInput;
                    synonym.corrections = this.newSynonyms;
                } else { // placeholder
                    synonym.placeholder = this.newInput;
                    synonym.replacements = this.newSynonyms;
                }

                return synonym;
            },
            save: async function () {
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                const task = await index.saveSynonym(this.getNewSynonym(), { forwardToReplicas: this.forwardToReplicas });
                this.saving = true;
                await index.waitTask(task['taskID']);
                this.saving = false;
                this.$emit('onStopEdit');
                this.$root.$emit('shouldTriggerSearch', this.indexName);
                this.$root.$emit('shouldTriggerSynonymsSearch', this.indexName);
            },
            onKeyDown: function (e, i) {
                if (e.which === 13 || (e.which === 9 && !e.shiftKey)) { // enter or tab
                    if (i + 1 > this.newSynonyms.length - 1) {
                        e.preventDefault();
                        e.stopImmediatePropagation();

                        this.newSynonyms.push('');

                        this.$nextTick(() => {
                            this.$refs[i + 1][0].focus();
                            this.$refs[i + 1][0].setSelectionRange(0, this.$refs[i + 1][0].value.length);
                        });
                    }
                }
                if ((e.which === 8 || (e.which === 9 && e.shiftKey)) && this.newSynonyms[i].length === 0 && i > 0) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    this.newSynonyms.pop();

                    this.$nextTick(() => {
                        this.$refs[i - 1][0].focus();
                        this.$refs[i - 1][0].setSelectionRange(this.$refs[i - 1][0].value.length, this.$refs[i - 1][0].value.length);
                    });
                }
            },
        }
    }
</script>
