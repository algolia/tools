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
                <div v-for="(condition, i) in newRule.conditions">
                    <div class="mt-16 py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                        {{ i > 0 ? 'OR': ''}} Condition
                        <trash-icon
                            v-if="newRule.conditions.length > 1"
                            class="ml-8 w-12 h-12 cursor-pointer"
                            @click="$delete(newRule.conditions, i)"
                        />
                    </div>
                    <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                        <div class="flex flex-wrap items-center w-212">
                            <div>
                                <input type="checkbox" v-model="newRule.conditions[i].hasPatternAndAnchoring" />
                                query
                            </div>
                            <div v-if="newRule.conditions[i].hasPatternAndAnchoring">
                                <div class="mx-4">
                                    <select v-model="newRule.conditions[i].anchoring" class="bg-white input-custom inline">
                                        <option value="contains">contains</option>
                                        <option value="is">is</option>
                                        <option value="startsWith">startsWith</option>
                                        <option value="endsWith">endsWith</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div v-if="newRule.conditions[i].hasPatternAndAnchoring">
                            <div>
                                <input
                                    v-model="newRule.conditions[i].pattern"
                                    v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                    class="input-custom inline w-full "
                                />
                            </div>
                        </div>
                    </div>
                    <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                        <div>
                            <input type="checkbox" v-model="newRule.conditions[i].alternatives" /> match with alternatives
                        </div>
                    </div>
                    <div class="py-8 flex flex-wrap border-t border-proton-grey-opacity-20">
                        <div class="w-188">
                            <input type="checkbox" v-model="newRule.conditions[i].hasFilters" /> filters are
                        </div>
                        <div class="ml-4 text-cosmos-black-opacity-70">
                            <div>
                                <div v-for="(group, j) in newRule.conditions[i].filters" class="mb-4">
                                    <input
                                        class="input-custom inline w-full"
                                        v-model="newRule.conditions[i].filters[j].attributeName"
                                        v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                    />
                                    =
                                    <input
                                        class="input-custom inline w-full"
                                        v-model="newRule.conditions[i].filters[j].attributeValue"
                                        v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                    />
                                    <trash-icon
                                        class="w-12 h-12 ml-8 mt-1 cursor-pointer text-cosmos-black-opacity-70"
                                        @click="newRule.conditions[i].filters.splice(j, 1)"
                                    />
                                </div>
                                <button
                                    class="mt-12 bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                                    @click="newRule.conditions[i].filters.push({attributeName: '', attributeValue: ''})"
                                >
                                    Add filter
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                        <div class="w-212">context</div>
                        <div>
                            <input
                                v-model="newRule.conditions[i].context"
                                v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                                class="input-custom inline w-full "
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        class="mt-16 bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
                        @click="newRule.conditions.push({hasPatternAndAnchoring: false, pattern: '', anchoring: 'is', context: '',alternatives: false})"
                    >
                        Add condition
                    </button>
                </div>
                <div class="mt-48 py-8 flex flex-wrap items-center tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                    Consequences
                </div>
                <div v-if="newRule.conditions.every((c) => c.hasPatternAndAnchoring) && facetsInQuery.length > 0" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <label class="cursor-pointer">
                            <input type="checkbox" v-model="newRule.hasAutomaticFilters" class="mr-1"/>
                            filter automatically on
                        </label>
                    </div>
                    <div v-if="newRule.hasAutomaticFilters">
                        <div v-for="(filter, facetName) in potentialFilters">
                            <label class="cursor-pointer">
                                <input
                                    type="checkbox"
                                    :checked="filter"
                                    @input="onAutomaticFilterChange(newRule.automaticFacetFilters, facetName, $event.target.checked)"
                                />
                                {{facetName}}
                            </label>
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
                <div v-if="newRule.conditions.every((c) => c.hasPatternAndAnchoring) && facetsInQuery.length > 0" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <label class="cursor-pointer">
                            <input type="checkbox" v-model="newRule.hasAutomaticOptionalFilters" class="mr-1"/>
                            optionalFilter automatically on
                        </label>
                    </div>
                    <div v-if="newRule.hasAutomaticOptionalFilters">
                        <div v-for="(filter, facetName) in potentialOptionalFilters">
                            <label class="cursor-pointer">
                                <input
                                    type="checkbox"
                                    :checked="filter"
                                    @input="onAutomaticFilterChange(newRule.automaticOptionalFacetFilters, facetName, $event.target.checked)"
                                />
                                {{facetName}}
                            </label>
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
                <div v-if="newRule.conditions.every((c) => c.hasPatternAndAnchoring)" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <label class="cursor-pointer">
                            <input type="checkbox" v-model="newRule.hasReplacedQuery" class="mr-1"/>
                            replace query by
                        </label>
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
                <div v-if="newRule.conditions.every((c) => c.hasPatternAndAnchoring)" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212" :class="newRule.hasReplacedQuery ? 'text-cosmos-black-opacity-30' : ''">
                        <label class="cursor-pointer">
                            <input :disabled="newRule.hasReplacedQuery" type="checkbox" v-model="newRule.hasRemovedWordsFromQuery"/>
                            remove from query
                        </label>
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
                <div v-if="newRule.conditions.every((c) => c.hasPatternAndAnchoring)" class="py-8 flex flex-wrap items-center border-t border-proton-grey-opacity-20">
                    <div class="w-212" :class="newRule.hasReplacedQuery ? 'text-cosmos-black-opacity-30' : ''">
                        <label class="cursor-pointer">
                            <input :disabled="newRule.hasReplacedQuery" type="checkbox" v-model="newRule.hasReplacedWordsFromQuery"/>
                            replace in query
                        </label>
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
                <div v-if="newRule.conditions.every((c) => c.hasPatternAndAnchoring)">
                    <div class="py-8 flex border-t border-proton-grey-opacity-20">
                        <div class="w-212">
                            <label class="cursor-pointer">
                                <input type="checkbox" v-model="newRule.hasPromote" class="mr-1"/>
                                promote
                            </label>
                        </div>
                        <div v-if="newRule.hasPromote" class="flex-grow">
                            <div v-for="(promoted, i) in newRule.promote" :key="promoted.objectID" class="mb-12">
                                <div>
                                    at pos
                                    <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        :value="newRule.promote[i].position + 1"
                                        @change="newRule.promote[i].position = parseInt($event.target.value) - 1"
                                        class="input-custom inline w-48"
                                    />
                                    <trash-icon
                                        class="w-12 h-12 ml-8 mt-1 cursor-pointer text-cosmos-black-opacity-70"
                                        @click="newRule.promote.splice(i, 1)"
                                    />
                                </div>
                                <div>
                                    <div class="flex w-full" :key="objectID" v-for="(objectID, j) in newRule.promote[i].objectIDs">
                                        <promoted-hit
                                            :ids="[objectID]"
                                            class="w-200"
                                            v-bind="$props"
                                            v-on="$listeners"
                                        />
                                        <div class="mt-16 ml-4 w-12 h-12" v-if="newRule.promote[i].objectIDs.length > 1">
                                            <trash-icon
                                                class="w-full h-full ml-4 cursor-pointer text-cosmos-black-opacity-70"
                                                @click="newRule.promote[i].objectIDs.splice(j, 1)"
                                            />
                                        </div>
                                    </div>
                                    <div class="ml-16 mt-8">
                                        <hit-autocomplete
                                            :params="{hitsPerPage: 4, enableRules: false}"
                                            input-classes="input input-custom min-w-184 px-8 py-2"
                                            value=""
                                            :placeholder="`New hit to promote at pos ${newRule.promote[i].position + 1}`"
                                            :display-empty-query="true"
                                            v-bind="$props"
                                            v-on="$listeners"
                                            @onSelected="addPromote($event, newRule.promote[i])"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="mt-24 mb-12">
                                <hit-autocomplete
                                    :params="{hitsPerPage: 4, enableRules: false}"
                                    input-classes="input input-custom min-w-184 px-8 py-2"
                                    value=""
                                    placeholder="New hit to promote at new pos"
                                    :display-empty-query="true"
                                    v-bind="$props"
                                    v-on="$listeners"
                                    @onSelected="addPromote($event)"
                                />
                            </div>
                        </div>
                    </div>
                    <div v-if="newRule.hasPromote" class="py-8 flex border-t border-proton-grey-opacity-20">
                        <div class="w-212">
                            <label class="cursor-pointer">
                                <input type="checkbox" v-model="newRule.filterPromotes" class="mr-1"/>
                                promote follow filters
                            </label>
                        </div>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <label class="cursor-pointer">
                            <input type="checkbox" v-model="newRule.hasHide" class="mr-1"/>
                            hide
                        </label>
                    </div>
                    <div v-if="newRule.hasHide">
                        <div v-for="(hide, i) in newRule.hide" class="flex w-full mb-12">
                            <promoted-hit
                                :ids="[newRule.hide[i].objectID]"
                                class="w-200"
                                v-bind="$props"
                                v-on="$listeners"
                            />
                            <div class="ml-4 w-12 h-12">
                                <trash-icon
                                    class="w-full h-full ml-4 cursor-pointer text-cosmos-black-opacity-70"
                                    @click="deleteHide(i)"
                                />
                            </div>
                        </div>
                        <div class="mt-24 mb-12">
                            <hit-autocomplete
                                :params="{hitsPerPage: 4, enableRules: false}"
                                value=""
                                placeholder="New hit to hide"
                                :display-empty-query="true"
                                v-bind="$props"
                                v-on="$listeners"
                                @onSelected="addHide"
                            />
                        </div>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <label class="cursor-pointer">
                            <input type="checkbox" v-model="newRule.hasParams" class="mr-1"/>
                            apply params
                        </label>
                    </div>
                    <div v-if="newRule.hasParams" class="flex-grow">
                        <params
                            :id="`${appId}-${indexName}-qr-${rule.objectID}`"
                            config-key="searchParams"
                            :params="newRule.editableParams"
                            :ref-params="newRule.editableParams"
                            :raw-params="newRule.editableParams"
                            :keys="Object.keys(newRule.editableParams)"
                            :keys-indexer="keysIndexer"
                            :mutate="true"
                        />
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">
                        <label class="cursor-pointer">
                            <input
                                type="checkbox"
                                :checked="newRule.filters.length > 0"
                                @input="$event.target.checked ? newRule.filters.push({facet: '', facetValue: '', operator: ':', score: 1}) : $set(newRule, 'filters', [])"
                                class="mr-1"
                            />
                            Filters
                        </label>
                    </div>
                    <div class="ml-4 text-cosmos-black-opacity-70" v-if="newRule.filters.length > 0">
                        <div v-for="(filter, i) in newRule.filters" class="mt-4">
                            <input v-model="newRule.filters[i].facet" class="input-custom p-4 w-72 inline" placeholder="attribute"/>
                            <select v-model="newRule.filters[i].operator" class="ml-8 p-0 input-custom text-sm inline">
                                <option value=":">is</option>
                                <option value=":-">is not</option>
                                <option value="=">=</option>
                                <option value="!=">!=</option>
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value=">=">&gt;=</option>
                                <option value="<=">&lt;=</option>
                            </select>
                            <input
                                v-model="newRule.filters[i].facetValue"
                                :type="[':', ':-'].includes(newRule.filters[i].operator) ? 'text' : 'number'"
                                class="ml-8 input-custom p-4 w-72 inline"
                                placeholder="value"
                            />
                        </div>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">
                        <label class="cursor-pointer">
                            <input
                                type="checkbox"
                                :checked="newRule.boosts.length > 0"
                                @input="$event.target.checked ? newRule.boosts.push({facet: '', facetValue: '', operator: ':', score: 1}) : $set(newRule, 'boosts', [])"
                                class="mr-1"
                            />
                            Boost
                        </label>
                    </div>
                    <div class="ml-4 text-cosmos-black-opacity-70" v-if="newRule.boosts.length > 0">
                        <div v-for="(boost, i) in newRule.boosts" class="mt-4">
                            <input v-model="newRule.boosts[i].facet" class="input-custom p-4 w-72 inline" placeholder="attribute"/>
                            <span class="ml-8">is</span>
                            <input v-model="newRule.boosts[i].facetValue" class="ml-8 input-custom p-4 w-72 inline" placeholder="value"/>
                            <span class="ml-8">score=</span>
                            <input v-model="newRule.boosts[i].score" type="number" min="1" class="input-custom p-4 w-48 inline" />
                        </div>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-188">
                        <label class="cursor-pointer">
                            <input
                                type="checkbox"
                                :checked="newRule.buries.length > 0"
                                @input="$event.target.checked ? newRule.buries.push({facet: '', facetValue: '', operator: ':-', score: 1}) : $set(newRule, 'buries', [])"
                                class="mr-1"
                            />
                            Bury
                        </label>
                    </div>
                    <div class="ml-4 text-cosmos-black-opacity-70" v-if="newRule.buries.length > 0">
                        <div v-for="(bury, i) in newRule.buries" class="mt-4">
                            <input v-model="newRule.buries[i].facet" class="input-custom p-4 w-72 inline" placeholder="attribute"/>
                            <span class="ml-8">is</span>
                            <input v-model="newRule.buries[i].facetValue" class="ml-8 input-custom p-4 w-72 inline" placeholder="value"/>
                            <span class="ml-8">score=</span>
                            <input v-model="newRule.buries[i].score" type="number" min="1" class="input-custom p-4 w-48 inline" />
                        </div>
                    </div>
                </div>
                <div class="py-8 flex border-t border-proton-grey-opacity-20">
                    <div class="w-212">
                        <label class="cursor-pointer">
                            <input type="checkbox" v-model="newRule.hasUserData" class="mr-1"/>
                            userData
                        </label>
                    </div>
                    <div v-if="newRule.hasUserData" class=" flex-grow">
                        <ace-editor
                            :id="`${appId}-${indexName}-userdata-${rule.objectID}`"
                            :styles="{ height: '60px' }"
                            :default-value="JSON.stringify(newRule.userData || {}, 0, 2)"
                            :on-change="onChangeUserData"
                            :on-validate="onValidateUserData"
                        />
                    </div>
                </div>
                <div
                    class="py-8 flex border-t border-proton-grey-opacity-20"
                    v-for="bloc in config.cms"
                >
                    <div class="min-w-188 w-188">
                        <label class="cursor-pointer">
                            <input
                                type="checkbox"
                                :checked="newRule.cms && newRule.cms[bloc.name]"
                                @input="addRemoveBloc($event, bloc.name)"
                                class="mr-1"
                            />
                            {{ bloc.label }}
                        </label>
                    </div>
                    <div class="ml-4 text-cosmos-black-opacity-70 min-w-0 w-full" v-if="newRule.cms[bloc.name] !== undefined">
                        <div v-for="(el, i) in newRule.cms[bloc.name]" class="mb-16">
                            <table class="overflow-hidden w-full">
                                <tr v-if="bloc.list">
                                    <td class="px-4 py-2 px-0">
                                        #{{ i }}
                                        <trash-icon
                                            class="-mt-2 ml-4 text-nova-grey hover:text-telluric-blue w-12 h-12 cursor-pointer"
                                            @click="$delete(newRule.cms[bloc.name], i)"
                                        />
                                    </td>
                                    <td class="px-4 py-2 truncate"></td>
                                </tr>
                                <tr v-for="(specs, attr) in bloc.fields" class="w-full">
                                    <td class="px-4 py-2 px-0">{{ attr }}</td>
                                    <td class="px-4 py-2 truncate w-full">
                                        <input
                                            v-if="specs.type === 'integer'"
                                            class="input-custom w-48"
                                            type="number"
                                            :min="specs.min"
                                            :max="specs.max"
                                            v-model.number="el[attr]"
                                        />
                                        <input
                                            v-if="specs.type === 'string'"
                                            class="input-custom w-full"
                                            v-model="el[attr]"
                                        />
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div v-if="bloc.list">
                            <button
                                @click="addBloc(bloc.name)"
                                class="bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            >
                                Add {{bloc.name}}
                            </button>
                        </div>
                    </div>
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
    import VueInputAutowidth from 'vue-input-autowidth';

    import AceEditor from "common/components/editor/AceEditor";
    import Params from "common/components/params/Params";
    import IntermediateRule from "./intermediateRule";
    import HitAutocomplete from "common/components/autocomplete/HitsAutocomplete";
    import PromotedHit from "common/components/explorer/synonyms-rules/PromotedHit";

    import TrashIcon from 'common/icons/trash.svg';
    import LoaderIcon from 'common/icons/loader.svg'
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import props from "common/components/explorer/props";

    export default {
        name: 'MerchRuleEdit',
        props: [
            'rule', 'allowSaveWithoutEdit', 'config',
            ...props.credentials,
            ...props.images,
            ...props.attributes,
            ...props.paramsAndSettings,
        ],
        components: {PromotedHit, HitAutocomplete, Params, AceEditor, TrashIcon, LoaderIcon},
        directives: {
            autowidth: VueInputAutowidth,
        },
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
                const allFacets = [];
                this.newRule.conditions.forEach((condition) => {
                    const facets = Array.from(condition.pattern.matchAll(/{facet:(.*?)}/g)).map((match) => {
                        return match[1];
                    });
                    allFacets.push(...facets);
                });
                return allFacets;
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

                for (let i = 0; i < this.newRule.conditions.length; i++) {
                    const condition = this.newRule.conditions[i];
                    if (condition.pattern && condition.pattern.length === 0 && condition.anchoring !== 'is') return false;
                }

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
            addPromote: function (hit, currentPromote, position) {
                const sameExistingHitIndex = this.newRule.promote.findIndex((p) => {
                    return p.objectIDs.includes(hit.objectID);
                });

                if (sameExistingHitIndex === -1) {
                    const objectID = hit.objectID || hit;

                    if (objectID && objectID.length > 0) {
                        if (currentPromote) { // group promote
                            currentPromote.objectIDs.push(objectID);
                        } else {
                            this.newRule.promote.push({objectIDs: [objectID], position: position || 0});
                        }
                    }
                } else if (position !== undefined) {
                    this.$set(this.newRule.promote[sameExistingHitIndex], 'position', position);
                }
            },
            addHide: function (hit) {
                const sameExistingHit = this.newRule.promote.find((p) => {
                    return p === hit.objectID;
                });

                if (!sameExistingHit) {
                    const objectID = hit.objectID || hit;
                    if (objectID && objectID.length > 0) {
                        this.newRule.hide.push({objectID});
                    }
                }
            },
            deleteHide: function (i) {
                this.$delete(this.newRule.hide, i);
            },
            addBloc: function (blocName) {
                const newBloc = {};
                const cmsSpec = this.config.cms.find((b) => b.name === blocName);
                Object.keys(cmsSpec.fields).forEach((attr) => {
                    newBloc[attr] = cmsSpec.fields[attr].default;
                })
                if (this.newRule.cms[blocName] === undefined) {
                    this.$set(this.newRule.cms, blocName, [newBloc]);
                } else {
                    this.newRule.cms[blocName].push(newBloc);
                }
            },
            addRemoveBloc: function ($event, blocName) {
                if ($event.target.checked) {
                    this.addBloc(blocName)
                } else {
                    this.$delete(this.newRule.cms, blocName);
                }
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
                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                try {
                    const task = await index.saveRule(this.newRule.getFinalRule(), { forwardToReplicas: this.forwardToReplicas });
                    this.saving = true;
                    await index.waitTask(task['taskID']);
                    this.saving = false;
                    this.$emit('onStopEdit');
                    this.$root.$emit('shouldTriggerSearch', this.indexName);
                    this.$root.$emit('shouldTriggerRulesSearch', this.indexName);
                } catch (e) {
                    this.saveError = e.message;
                }
            },
        }
    }
</script>
