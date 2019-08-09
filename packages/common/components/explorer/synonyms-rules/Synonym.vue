<template>
    <div>
        <div class="flex hit" v-if="!editMode">
            <div class="min-w-20p w-20p p-8 truncate">
                <input
                    v-if="checked !== undefined"
                    type="checkbox"
                    @input="$emit('updateChecked', $event.target.checked)"
                    :checked="checked"
                    class="mr-12"
                /> {{synonym.objectID}}
            </div>
            <div class="max-w-80p p-8">
                <div class="flex flex-wrap">
                    <div>
                        <span class="text-cosmos-black-opacity-70" v-html="highlightInput"></span>
                        <span class="mx-4">{{ isSynonym ? '<=>' : '=>'}}</span>
                    </div>
                    <div v-for="(s, index) in highlightSynonyms">
                        <span class="text-cosmos-black-opacity-70" v-html="s">{{s}}</span>
                        <span class="mx-4" v-if="index < synonyms.length - 1">
                            {{isSynonym ? '<=>' : 'OR'}}
                        </span>
                    </div>
                    <div class="mx-4" v-if="synonym.type.toLowerCase() === 'altcorrection1'">+1 typo</div>
                    <div class="mx-4" v-if="synonym.type.toLowerCase() === 'altcorrection2'">+2 typos</div>
                </div>
            </div>
            <div class="flex items-center ml-auto mr-8">
                <button class="relative group" v-if="canJumpSynonyms && jumpTo === 'leftPanel'">
                    <flip-left-icon
                        class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                        @click="jumpSynonym"
                    />
                    <tooltip>Copy this synonym in the left panel index.<br>Will ask for confirmation</tooltip>
                </button>
                <button class="relative group" v-if="canJumpSynonyms && jumpTo === 'rightPanel'">
                    <flip-right-icon
                        class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                        @click="jumpSynonym"
                    />
                    <tooltip>Copy this synonym in the right panel index.<br>Will ask for confirmation</tooltip>
                </button>
                <button class="relative group">
                    <edit-icon
                        class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                        @click="editMode = true"
                    />
                    <tooltip>Edit synonym. Will ask for confirmation</tooltip>
                </button>
                <button class="relative group">
                    <trash-icon
                        class="ml-8 text-nova-grey-opacity-60 hover:text-telluric-blue w-16 h-16 cursor-pointer"
                        @click="confirmDelete = true"
                    />
                    <tooltip>Delete synonym. Will ask for confirmation</tooltip>
                </button>
            </div>
        </div>
        <synonym-edit
            v-if="editMode"
            :synonym="synonym"
            class="my-12 mx-8"
            v-bind="$props"
            v-on="$listeners"
            @onStopEdit="editMode = false"
        />
        <synonym-delete
            v-if="confirmDelete"
            :synonym="synonym"
            class="my-12 mx-8"
            v-bind="$props"
            v-on="$listeners"
            @onStopDelete="confirmDelete = false"
        />
    </div>
</template>

<script>
    import EditIcon from 'common/icons/edit.svg';
    import TrashIcon from 'common/icons/trash.svg';
    import FlipLeftIcon from "common/icons/flip-left.svg";
    import FlipRightIcon from "common/icons/flip-right.svg";

    import SynonymDelete from "./SynonymDelete";
    import Tooltip from "../../Tooltip";
    import SynonymEdit from "./SynonymEdit";
    import synonymMixin from "./synonymMixin";
    import props from "../props";

    export default {
        name: 'Synonym',
        props: [
            'synonym', 'checked',
            ...props.actions,
            ...props.credentials,
        ],
        components: {SynonymEdit, Tooltip, SynonymDelete, EditIcon, TrashIcon, FlipLeftIcon, FlipRightIcon},
        mixins: [synonymMixin],
        data: function () {
            return {
                editMode: false,
                confirmDelete: false,
            };
        },
        methods: {
            jumpSynonym: function () {
                this.$root.$emit(`${this.jumpTo}SynonymJumping`, this.synonym);
                window.scrollTo(0, 0);
            },
        },
    }
</script>