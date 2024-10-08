<template>
    <div v-if="currentTab === 'synonyms' || currentTab === 'rules'">
        <div class="flex flex-wrap items-center">
            <input
                v-model="queryFilter"
                :placeholder="placeholder"
                class="px-8 bg-proton-grey-opacity-20 rounded py-8 text-telluric-blue"
            />
            <div class="ml-8 text-sm" v-if="isRule">
                Status:
                <select v-model="rulesStatus" class="outline-none">
                    <option value="all">All</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                </select>
            </div>
            <div class="ml-auto flex items-center" v-if="!readOnly">
                <button class="relative group">
                    <plus-circle-icon
                        @click="isAdding = true"
                        class="w-16 h-16 text-nova-grey-opacity-60 cursor-pointer hover:text-telluric-blue"
                    />
                    <tooltip>{{isRule ? 'Add Rule' : 'Add Synonym'}}</tooltip>
                </button>
            </div>
        </div>
        <div v-if="jumpedToReadOnly" class="my-12 bg-saturn-5 rounded text-solstice-blue-opacity-80 p-8">
            This panel is in readonly mode
        </div>
        <div
            v-if="isAdding && !isRule"
            class="my-12"
        >
            <div class="flex text-xs uppercase tracking-wide">
                <div class="w-20p p-8">Synonym ID</div>
                <div class="w-80p p-8">Synonym value</div>
            </div>
            <synonym-edit
                @onStopEdit="isAdding = false"
                v-bind="$props"
                v-on="$listeners"
                :synonym="jumpedElt || { objectID: `syn-${Math.random().toString(36).substr(2, 9)}`, type: 'synonym', synonyms: ['', '']}"
                :allow-save-without-edit="jumpedElt"
                class="mx-8 border-t border-proton-grey-opacity-30"
            />
        </div>
        <div
            v-if="isAdding && isRule"
            class="my-12"
        >
            <rule-edit
                @onStopEdit="isAdding = false"
                v-bind="$props"
                v-on="$listeners"
                :rule="
                    jumpedElt || {
                        objectID: `rule-${Math.random().toString(36).substr(2, 9)}`,
                        condition: {pattern: '', anchoring: 'contains'},
                        consequence: {}
                    }
                "
            />
        </div>
        <collection
            :type="isRule ? 'rules': 'synonyms'"
            :objs="objs"
            class="mt-12"
            v-bind="$props"
            v-on="$listeners"
        />
        <div class="flex justify-center">
            <pagination
                @onUpdatePage="page = $event"
                :page="page"
                :nb-pages="nbPages"
            />
        </div>
    </div>
</template>

<script>
    import Collection from "./Collection.vue";

    import PlusCircleIcon from "../../../icons/plus-circle.svg";
    import Tooltip from "../../Tooltip.vue";
    import SynonymEdit from "./SynonymEdit.vue";
    import RuleEdit from "./RuleEdit.vue";
    import Pagination from "../results/Pagination.vue";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";

    import props from "../props";

    export default {
        name: 'Fetcher',
        components: {Pagination, RuleEdit, SynonymEdit, Tooltip, Collection, PlusCircleIcon},
        props: [
            'methodName',
            'panelKey',
            'currentTab',
            ...props.credentials,
            ...props.actions,
            ...props.images,
            ...props.attributes,
            ...props.paramsAndSettings,
        ],
        data: function () {
            return {
                objs: [],
                allObjs: [],
                queryFilter: '',
                page: 0,
                nbPages: 0,
                isAdding: false,
                jumpedElt: null,
                isRule: this.methodName === 'searchRules',
                rulesStatus: 'all',
                jumpedToReadOnly: false,
            };
        },
        computed: {
            placeholder: function () {
                return this.isRule ? 'Search rules' : 'Search synonyms';
            },
            extraParams: function () {
                const extraParams = {};
                if (this.isRule) {
                    if (this.rulesStatus === 'enabled') extraParams.enabled = true;
                    else if (this.rulesStatus === 'disabled') extraParams.enabled = false;
                }
                return extraParams;
            }
        },
        created: function () {
            const shouldFetchAll = !this.isRule;
            if (shouldFetchAll) {
                this.search(this.page, true);
            }
            this.search(this.page, false);

            const eventName = this.isRule ? 'shouldTriggerRulesSearch': 'shouldTriggerSynonymsSearch';
            this.$root.$on(eventName, (indexName) => {
                if (indexName === this.indexName) {
                    if (shouldFetchAll) {
                        this.search(this.page, true);
                    }
                    this.search(this.page, false);
                }
            });

            this.$root.$on(`${this.panelKey}SynonymJumping`, (record) => {
                if (!this.readOnly) {
                    if (!this.isRule) {
                        this.isAdding = true;
                        this.jumpedElt = record;
                    }
                } else {
                    this.jumpedToReadOnly = true;
                    window.setTimeout(() => {
                        this.jumpedToReadOnly = false;
                    }, 10000)
                }
            });

            this.$root.$on(`${this.panelKey}RuleJumping`, (record) => {
                if (!this.readOnly) {
                    if (this.isRule) {
                        this.isAdding = true;
                        this.jumpedElt = record;
                    }
                } else {
                    this.jumpedToReadOnly = true;
                    window.setTimeout(() => {
                        this.jumpedToReadOnly = false;
                    }, 10000)
                }
            });
        },
        watch: {
            queryFilter: function () { this.search(this.page, false);},
            page: function () { this.search(this.page, false);},
            rulesStatus: function () { this.search(this.page, false);},
            appId: function (o, n) { if (o !== n) this.search(0, true); this.search(0, false); },
            indexName: function (o, n) { if (o !== n) this.search(0, true); this.search(0, false); },
        },
        methods: {
            search: async function (page, loadAll) {
                if (!this.appId || !this.apiKey) return;

                if (page === 0 && loadAll) {
                    this.allObjs = [];
                }

                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                const hitsPerPage = loadAll ? 1000 : 20;
                const res = await index[this.methodName](this.queryFilter, {
                    page: page,
                    hitsPerPage: hitsPerPage,
                    ...this.extraParams,
                });


                if (loadAll) {
                    this.allObjs.push(...res.hits);
                    this.$emit('onFetch', this.allObjs, res.nbHits);
                } else {
                    this.nbPages = Math.ceil(res.nbHits / hitsPerPage);
                    this.objs = res.hits;
                    this.$emit('onFetch', this.allObjs, res.nbHits);
                }
                while (loadAll && this.allObjs.length < res.nbHits) {
                    await this.search(page + 1, loadAll);
                }
            }
        }
    }
</script>
