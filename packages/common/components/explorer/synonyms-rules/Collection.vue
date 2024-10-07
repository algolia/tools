<template>
    <div>
        <div v-if="objs.length > 0">
            <div class="flex items-center">
                <div v-if="batchAction === null" class="mb-24 p-8">
                    <button
                        class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12"
                        v-if="batchable.length !== objsToDisplay.length" @click="checkAll"
                    >
                        Select all
                    </button>
                    <button
                        class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12"
                        v-if="batchable.length > 0" @click="uncheckAll"
                    >
                        Deselect all
                    </button>
                </div>
                <div class="ml-auto mb-24 p-8" v-if="batchAction === null">
                    <button
                        class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12 relative group"
                        v-if="isRule && batchable.length > 0" @click="batchAction = 'enableAllRules'"
                    >
                        Enable all ({{batchable.length}})
                        <tooltip>Will ask for confirmation</tooltip>
                    </button>
                    <button
                        class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12 relative group"
                        v-if="isRule && batchable.length > 0" @click="batchAction = 'disableAllRules'"
                    >
                        Disable all ({{batchable.length}})
                        <tooltip>Will ask for confirmation</tooltip>
                    </button>
                    <button
                        class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12 relative group"
                        v-if="batchable.length > 0" @click="batchAction = (isRule ? 'deleteAllRules': 'deleteAllSynonyms')"
                    >
                        Delete all ({{batchable.length}})
                        <tooltip>Will ask for confirmation</tooltip>
                    </button>
                </div>
            </div>
            <rule-batch
                v-if="batchAction !== null"
                @onStopEdit="batchAction = null"
                :batchable="batchable"
                :action="batchAction"
                class="mb-24"
                v-bind="$props"
                v-on="$listeners"
            />
            <div v-if="type === 'synonyms'" class="flex text-xs uppercase tracking-wide">
                <div class="w-20p p-8">Synonym ID</div>
                <div class="w-80p p-8">Synonym value</div>
            </div>
            <div v-if="type === 'synonyms'">
                <div v-for="synonym in objsToDisplay" :key="synonym.objectID" class="border-t border-proton-grey-opacity-30">
                    <synonym
                        :synonym="synonym"
                        @updateChecked="checkedList[synonym.objectID] = $event"
                        :checked="checkedList[synonym.objectID]"
                        v-bind="$props"
                        v-on="$listeners"
                    />
                </div>
            </div>
            <div v-if="type === 'rules'">
                <div v-for="rule in objsToDisplay" :key="rule.objectID">
                    <rule
                        :rule="rule"
                        @updateChecked="checkedList[rule.objectID] = $event"
                        :checked="checkedList[rule.objectID]"
                        :class="{'bg-moon-grey': checkedList[rule.objectID]}"
                        v-bind="$props"
                        v-on="$listeners"
                    />
                </div>
            </div>
        </div>
        <div v-if="objs.length === 0" class="p-8">
            No results
        </div>
        <div v-if="needsCollapse" class="flex border-t border-proton-grey-opacity-30">
            <div class="cursor-pointer mx-auto p-8" @click="expanded = !expanded">
                <span v-if="!expanded">Show all ({{objs.length}})</span>
                <span v-else>Show less</span>
            </div>
        </div>
    </div>
</template>

<script>
    import Synonym from "./Synonym.vue";
    import Rule from "./Rule.vue";
    import RuleBatch from "./RuleBatch.vue";
    import Tooltip from "../../Tooltip.vue";
    import props from "../props";

    export default {
        name: 'Collection',
        components: {Tooltip, RuleBatch, Rule, Synonym},
        props: [
            'objs', 'type', 'needShowMoreButton',
            ...props.credentials,
            ...props.actions,
            ...props.images,
            ...props.attributes,
            ...props.paramsAndSettings,
        ],
        data: function () {
            return {
                expanded: false,
                maxCollapseSize: 10,
                checkedList: {},
                isRule: this.type === 'rules',
                batchAction: null,
            }
        },
        watch: {
            objsToDisplay: function () { this.checkedList = {}; },
        },
        computed: {
            needsCollapse: function () {
                return this.needShowMoreButton && this.objs.length > this.maxCollapseSize;
            },
            objsToDisplay: function () {
                if (!this.expanded) {
                    return this.objs.slice(0, this.maxCollapseSize);
                }
                return this.objs
            },
            batchable: function () {
                return this.objs.filter((obj) => { return this.checkedList[obj.objectID]; }).map((obj) => {
                    const {_highlightResult, ...objWithoutHighlight} = obj;
                    return objWithoutHighlight;
                });
            }
        },
        methods: {
            checkAll: function () {
                this.objsToDisplay.forEach((obj) => {
                    this.$set(this.checkedList, obj.objectID, true);
                });
            },
            uncheckAll: function () {
                this.checkedList = {};
            },
        }
    }
</script>
