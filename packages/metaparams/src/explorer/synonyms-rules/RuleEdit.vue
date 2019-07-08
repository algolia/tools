<template>
    <div class="bg-moon-grey-opacity-50 border border-proton-grey-opacity-20">
        <div v-if="!saving">
            <div class="w-full p-8">
                <div class="py-8 flex flex-wrap items-center tracking-wide uppercase text-cosmos-black-opacity-70">
                    <input
                        v-model="newRule.objectID"
                        v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                        class="input-custom inline"
                    />
                    <select v-model="newRule.enabled" class="ml-12 outline-none bg-white input-custom inline">
                        <option :value="true">enabled</option>
                        <option :value="false">disabled</option>
                    </select>
                </div>
                <div class="mt-16 py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                    Condition
                </div>
                <div v-if="newRule.validity && newRule.validity.length > 0" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">validity periods</div>
                    <div v-for="validityPeriod in newRule.validity">
                        from
                        <span>
                                {{new Date(validityPeriod.from * 1000).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})}}
                        </span>
                        to
                        <span>
                                {{new Date(validityPeriod.until * 1000).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})}}
                        </span>
                    </div>
                </div>
                <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        if query
                        <select v-model="newRule.anchoring" class="bg-white input-custom inline">
                            <option value="contains">contains</option>
                            <option value="is">is</option>
                            <option value="startsWith">startsWith</option>
                            <option value="endsWith">endsWith</option>
                        </select>
                    </div>
                    <div>
                        <input
                            v-model="newRule.pattern"
                            v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                            class="input-custom inline w-full "
                        />
                    </div>
                </div>
                <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">in context</div>
                    <div>
                        <input
                            v-model="newRule.context"
                            v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                            class="input-custom inline w-full "
                        />
                    </div>
                </div>
                <div class="mt-16 py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                    Consequences
                </div>
                <div v-if="facetsInQuery.length > 0" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <input type="checkbox" v-model="newRule.hasAutomaticFilters" class="mr-1"/>
                        filter automatically on
                    </div>
                    <div v-if="newRule.hasAutomaticFilters">
                        <div v-for="(filter, facetName) in potentialFilters">
                            <input
                                type="checkbox"
                                :checked="filter"
                                @input="onAutomaticFilterChange(newRule.automaticFacetFilters, facetName, $event.target.checked)"
                            />
                            {{facetName}}
                            <span v-if="filter">
                                &lt;score=
                                <input type="number" min="1" max="10"
                                       v-model.number="filter.score"
                                       class="input-custom inline w-36"
                                />
                                &gt;
                                <select v-model="filter.disjunctive" class="bg-white input-custom inline">
                                    <option :value="false">Conjunctive (AND)</option>
                                    <option :value="true">Disjunctive (OR)</option>
                                </select>
                            </span>
                        </div>
                    </div>
                </div>
                <div v-if="facetsInQuery.length > 0" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <input type="checkbox" v-model="newRule.hasAutomaticOptionalFilters" class="mr-1"/>
                        optionalFilter automatically on
                    </div>
                    <div v-if="newRule.hasAutomaticOptionalFilters">
                        <div v-for="(filter, facetName) in potentialOptionalFilters">
                            <input
                                type="checkbox"
                                :checked="filter"
                                @input="onAutomaticFilterChange(newRule.automaticOptionalFacetFilters, facetName, $event.target.checked)"
                            />
                            {{facetName}}
                            <span v-if="filter">
                                &lt;score=
                                <input type="number" min="1" max="10"
                                       v-model.number="filter.score"
                                       class="input-custom inline w-36"
                                />
                                &gt;
                                <select v-model="filter.disjunctive" class="bg-white input-custom inline">
                                    <option :value="false">Conjunctive (AND)</option>
                                    <option :value="true">Disjunctive (OR)</option>
                                </select>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <input type="checkbox" v-model="newRule.hasReplacedQuery" class="mr-1"/>
                        replace query by
                    </div>
                    <div v-if="newRule.hasReplacedQuery">
                        <input
                            v-model="newRule.replacedQuery"
                            v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                            placeholder="new query"
                            class="input-custom inline "
                        />
                    </div>
                </div>
                <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212" :class="newRule.hasReplacedQuery ? 'text-cosmos-black-opacity-30' : ''">
                        <input :disabled="newRule.hasReplacedQuery" type="checkbox" v-model="newRule.hasReplacedWordsFromQuery"/>
                        replace in query
                    </div>
                    <div v-if="!newRule.hasReplacedQuery && newRule.hasReplacedWordsFromQuery">
                        <div v-for="(word, i) in newRule.replacedWordsFromQuery">
                            <input
                                :ref="`replace-${i}-0`"
                                v-model="newRule.replacedWordsFromQuery[i][0]"
                                v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                @keydown="onKeyDown($event, newRule.replacedWordsFromQuery, i, ['', ''], 0, 'replace')"
                                placeholder="removed word"
                                class="input-custom inline "
                            />
                            =>
                            <input
                                :ref="`replace-${i}-1`"
                                v-model="newRule.replacedWordsFromQuery[i][1]"
                                v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                @keydown="onKeyDown($event, newRule.replacedWordsFromQuery, i, ['', ''], 1, 'replace')"
                                placeholder="replaced word"
                                class="input-custom inline "
                            />
                        </div>
                    </div>
                </div>
                <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212" :class="newRule.hasReplacedQuery ? 'text-cosmos-black-opacity-30' : ''">
                        <input :disabled="newRule.hasReplacedQuery" type="checkbox" v-model="newRule.hasRemovedWordsFromQuery"/>
                        remove from query
                    </div>
                    <div v-if="!newRule.hasReplacedQuery && newRule.hasRemovedWordsFromQuery">
                        <span v-for="(word, i) in newRule.removedWordsFromQuery">
                            <input
                                :ref="`remove-${i}-0`"
                                v-model="newRule.removedWordsFromQuery[i]"
                                @keydown="onKeyDown($event, newRule.removedWordsFromQuery, i, '', 0, 'remove')"
                                v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                placeholder="removed word"
                                class="mr-4 input-custom inline "
                            />
                        </span>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <input type="checkbox" v-model="newRule.hasPromote" class="mr-1"/>
                        promote
                    </div>
                    <div v-if="newRule.hasPromote" class="flex-grow">
                        <div v-for="(promoted, i) in newRule.promote" :key="promoted.objectID" class="flex w-full mb-12">
                            <promoted-hit :panel-key="panelKey" :id="newRule.promote[i].objectID" class="w-200"/>
                            <div class="ml-12">
                                position
                                <input
                                    type="number"
                                    min="0"
                                    max="1000"
                                    v-model.number="newRule.promote[i].position"
                                    class="input-custom inline w-48"
                                />
                            </div>
                            <div class="ml-4 w-12 h-12">
                                <trash-icon
                                    class="w-full h-full ml-4 cursor-pointer text-cosmos-black-opacity-70"
                                    @click="deletePromote(i)"
                                />
                            </div>
                        </div>
                        <div class="mt-24 mb-12">
                            <panel-hit-autocomplete
                                :panel-key="panelKey"
                                :params="{hitsPerPage: 4, enableRules: false}"
                                value=""
                                placeholder="Search for a new hit to promote"
                                :display-empty-query="true"
                                @onSelected="addPromote"
                            />
                        </div>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <input type="checkbox" v-model="newRule.hasHide" class="mr-1"/>
                        hide
                    </div>
                    <div v-if="newRule.hasHide">
                        <div v-for="(hide, i) in newRule.hide" class="flex w-full mb-12">
                            <promoted-hit :panel-key="panelKey" :id="newRule.hide[i]" class="w-200"/>
                            <div class="ml-4 w-12 h-12">
                                <trash-icon
                                    class="w-full h-full ml-4 cursor-pointer text-cosmos-black-opacity-70"
                                    @click="deleteHide(i)"
                                />
                            </div>
                        </div>
                        <div class="mt-24 mb-12">
                            <panel-hit-autocomplete
                                :panel-key="panelKey"
                                :params="{hitsPerPage: 4, enableRules: false}"
                                value=""
                                placeholder="Search for a new hit to hide"
                                :display-empty-query="true"
                                @onSelected="addHide"
                            />
                        </div>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <input type="checkbox" v-model="newRule.hasParams" class="mr-1"/>
                        apply params
                    </div>
                    <div v-if="newRule.hasParams" class="flex-grow">
                        <params
                            :id="`${panelKey}-qr-${rule.objectID}`"
                            config-key="searchParams"
                            :params="newRule.editableParams"
                            :ref-params="newRule.editableParams"
                            :raw-params="newRule.editableParams"
                            :keys="Object.keys(newRule.editableParams)"
                            :panelKeysIndexer="panelKeysIndexer"
                            @onSetParamValue="onSetParamValue"
                            @onAddArrayElement="onAddArrayElement"
                            @onDeleteArrayElement="onDeleteArrayElement"
                            @onDeleteKey="onDeleteKey"
                            :open="true"
                        />
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <input type="checkbox" v-model="newRule.hasUserData" class="mr-1"/>
                        userData
                    </div>
                    <div v-if="newRule.hasUserData" class=" flex-grow">
                        <ace-editor
                            :id="`${panelKey}-${rule.objectID}`"
                            :styles="{ height: '60px' }"
                            :default-value="JSON.stringify(newRule.userData || {}, 0, 2)"
                            :on-change="onChangeUserData"
                            :on-validate="onValidateUserData"
                        />
                    </div>
                </div>
            </div>
            <div class="flex justify-end my-16">
                <div v-if="saveError" class="border border-mars-1 mr-8 p-8 rounded">
                    {{saveError}}
                </div>
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
            <div class="ml-16">Saving {{newRule.objectID}}</div>
        </div>
    </div>
</template>

<script>
    import AceEditor from "@/editor/AceEditor";
    import Params from "@/params/Params";
    import IntermediateRule from "@/explorer/synonyms-rules/intermediateRule";
    import PanelHitAutocomplete from "@/autocomplete/PanelHitsAutocomplete";
    import PromotedHit from "@/explorer/synonyms-rules/PromotedHit";

    import TrashIcon from '~/icons/trash.svg';
    import LoaderIcon from '~/icons/loader.svg'
    import indexMixin from "@/mixins/indexMixin";

    export default {
        name: 'RuleEdit',
        props: ['rule', 'panelKey', 'allowSaveWithoutEdit'],
        components: {PromotedHit, PanelHitAutocomplete, Params, AceEditor, TrashIcon, LoaderIcon},
        mixins: [indexMixin],
        data: function () {
            const data = {
                oldRule: new IntermediateRule(this.rule),
                newRule: new IntermediateRule(this.rule),
                nbErrorsUserData: 0,
                saveError: null,
                saving: false,
            };

            if (data.newRule.replacedWordsFromQuery.length === 0) data.newRule.replacedWordsFromQuery.push(['', '']);
            if (data.newRule.removedWordsFromQuery.length === 0) data.newRule.removedWordsFromQuery.push('');
            if (data.newRule.replacedQuery === false) data.newRule.replacedQuery = '';

            return data;
        },
        computed: {
            facetsInQuery: function () {
                return Array.from(this.newRule.pattern.matchAll(/{facet:(.*?)}/g)).map((match) => {
                    return match[1];
                })
            },
            potentialFilters: function () {
                const potentialFilters = {};
                this.facetsInQuery.forEach((facetName) => {
                    potentialFilters[facetName] = this.newRule.automaticFacetFilters.find((filter) => {
                        return filter.facet === facetName;
                    });
                });

                return potentialFilters;
            },
            potentialOptionalFilters: function () {
                const potentialFilters = {};
                this.facetsInQuery.forEach((facetName) => {
                    potentialFilters[facetName] = this.newRule.automaticOptionalFacetFilters.find((filter) => {
                        return filter.facet === facetName;
                    });
                });

                return potentialFilters;
            },
            canBeSaved: function () {
                if (this.newRule.objectID.length <= 0) return false;
                if (this.newRule.pattern.length === 0 && this.newRule.anchoring !== 'is') return false;

                if (this.newRule.hasUserData && this.nbErrorsUserData > 0) return false;

                if (this.newRule.hasRemovedWordsFromQuery) {
                    if (this.newRule.removedWordsFromQuery.filter((word) => { return word.length > 0 }).length <= 0) {
                        return false;
                    }
                }

                if (this.newRule.hasReplacedWordsFromQuery) {
                    const replacedWordsFromQuery = this.newRule.replacedWordsFromQuery.filter((word) => {
                        return word[0].length > 0 && word[1].length > 0;
                    });

                    if (replacedWordsFromQuery.length <= 0) {
                        return false;
                    }
                }

                return true;
            }
        },
        methods: {
            onAutomaticFilterChange: function (arr, facetName, value) {
                if (value) {
                    arr.push({facet: facetName, score: 1, disjunctive: false})
                } else {
                    const index = arr.findIndex((elt) => {return elt.facet === facetName});
                    arr.splice(index, 1);
                }
            },
            onChangeUserData: function (newValue) {
                try {
                    this.newRule.userData = JSON.parse(newValue);
                } catch  (e) {
                    this.newRule.userData = {};
                }
            },
            onValidateUserData: function (annotations) {
                this.nbErrorsUserData = annotations.length;
            },
            onSetParamValue: function (key, value) {
                this.$set(this.newRule.editableParams, key, {value: JSON.parse(JSON.stringify(value)), enabled: true});
            },
            onAddArrayElement: function (inputKey) {
                const newVal = JSON.parse(JSON.stringify(this.newRule.editableParams[inputKey].value));
                newVal.push('');
                this.onSetParamValue(inputKey, newVal);
            },
            onDeleteArrayElement: function (inputKey, positionKey) {
                this.$delete(this.newRule.editableParams[inputKey].value, positionKey);
            },
            onDeleteKey: function (inputKey) {
                this.$delete(this.newRule.editableParams, inputKey);
            },
            addPromote: function (hit) {
                const sameExistingHit = this.newRule.promote.find((p) => {
                    return p.objectID === hit.objectID;
                });

                if (!sameExistingHit) {
                    const objectID = hit.objectID || hit;
                    if (objectID && objectID.length > 0) {
                        this.newRule.promote.push({objectID, position: 0});
                    }
                }
            },
            deletePromote: function (i) {
                this.$delete(this.newRule.promote, i);
            },
            addHide: function (hit) {
                const sameExistingHit = this.newRule.promote.find((p) => {
                    return p === hit.objectID;
                });

                if (!sameExistingHit) {
                    const objectID = hit.objectID || hit;
                    if (objectID && objectID.length > 0) {
                        this.newRule.hide.push(objectID);
                    }
                }
            },
            deleteHide: function (i) {
                this.$delete(this.newRule.hide, i);
            },
            onKeyDown: function (e, obj, i, defaultValue, inputNumber, prefix) {
                let nextI;
                let nextInput;
                if (e.which === 13 || (e.which === 9 && !e.shiftKey)) { // enter or tab
                    if (i + 1 > obj.length - 1) {
                        e.preventDefault();
                        e.stopImmediatePropagation();

                        nextI = i;
                        nextInput = 0;

                        if (Array.isArray(obj[0])) {
                            if (inputNumber >= obj[0].length - 1) {
                                nextI = nextI + 1;
                            } else {
                                nextInput = nextInput + 1;
                            }
                        } else {
                            nextI = nextI + 1;
                        }

                        if (nextI !== i) {
                            obj.push(defaultValue);
                        }

                        if (nextI !== i || inputNumber !== nextInput) {
                            this.$nextTick(() => {
                                this.$refs[`${prefix}-${nextI}-${nextInput}`][0].focus();
                                this.$refs[`${prefix}-${nextI}-${nextInput}`][0].setSelectionRange(
                                    0,
                                    this.$refs[`${prefix}-${nextI}-${nextInput}`][0].value.length
                                );
                            });
                        }
                    }
                }
                if ((e.which === 8 || (e.which === 9 && e.shiftKey)) && e.target.value.length === 0) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    nextI = i;
                    nextInput = 0;

                    if (Array.isArray(obj[0])) {
                        if (inputNumber === 0) {
                            nextI = nextI - 1;
                            nextInput = obj[0].length - 1;
                        } else {
                            nextInput = inputNumber - 1;
                        }
                    } else {
                        nextI = i - 1;
                    }

                    if (nextI !== i && nextI >= 0) {
                        obj.pop();
                    }

                    if (nextI >= 0) {
                        this.$nextTick(() => {
                            this.$refs[`${prefix}-${nextI}-${nextInput}`][0].focus();
                            this.$refs[`${prefix}-${nextI}-${nextInput}`][0].setSelectionRange(
                                this.$refs[`${prefix}-${nextI}-${nextInput}`][0].value.length,
                                this.$refs[`${prefix}-${nextI}-${nextInput}`][0].value.length
                            );
                        });
                    }
                }
            },
            save: async function () {
                const index = await this.getSearchIndex();
                try {
                    const task = await index.saveRule(this.newRule.getFinalRule(), { forwardToReplicas: this.forwardToReplicas });
                    this.saving = true;
                    await index.waitTask(task['taskID']);
                    this.saving = false;
                    this.$emit('onStopEdit');
                    this.$root.$emit('shouldTriggerSearch', this.panelIndexName);
                    this.$root.$emit('shouldTriggerRulesSearch', this.panelIndexName);
                } catch (e) {
                    this.saveError = e.message;
                }
            },
        }
    }
</script>