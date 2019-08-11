<template>
    <div>
        <div>
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-proton-grey bg-white p-8 bg-proton-grey-opacity-40">
                When
            </div>
            <div class="px-8 pb-16 py-12">
                <div class="mt-8 mb-16 pb-4 text-xs text-cosmos-black-opacity-70 uppercase tracking-wide border-b border-proton-grey-opacity-20">
                    Query
                </div>
                <div class="flex items-center px-12 bg-white rounded border border-proton-grey-opacity-60">
                    <search-icon class="block w-12 h-12 mr-12 text-telluric-blue-opacity-60 fill-current"/>
                    <input
                        class="flex-1 block h-full py-8 bg-transparent text-black leading-normal"
                        placeholder="Search for anything"
                        v-model="query"
                    >
                </div>
                <div class="mt-32 mb-16 pb-4 text-xs text-cosmos-black-opacity-70 uppercase tracking-wide border-b border-proton-grey-opacity-20">
                    Extra search params
                </div>
                <params
                    id="when"
                    config-key="searchParams"
                    :params="testData.when"
                    :ref-params="testData.when"
                    :raw-params="testData.when"
                    :keys="Object.keys(testData.when)"
                    :panelKeysIndexer="null"
                    @onSetParamValue="onSetParamValue"
                    @onAddArrayElement="onAddArrayElement"
                    @onDeleteArrayElement="onDeleteArrayElement"
                    @onDeleteKey="onDeleteKey"
                />
            </div>
        </div>
        <div>
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-t border-b border-proton-grey bg-white p-8 bg-proton-grey-opacity-40">
                Then
            </div>
            <div class="px-8 py-12">
                <div v-for="(testCase, i) in testData.then" class="mb-32">
                    <div class="flex my-8 pb-4 border-b border-proton-grey-opacity-20">
                        <div class="text-xs text-cosmos-black-opacity-70 uppercase tracking-wide">
                            Test {{i + 1}}
                        </div>
                        <trash-icon
                            class="ml-auto text-nova-grey-opacity-60 hover:text-telluric-blue w-12 h-12 cursor-pointer"
                            @click="deleteTest(testData.then, i)"
                        />
                    </div>
                    <div class="flex">
                        <div class="flex flex-wrap mx-auto bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 p-8 rounded">
                            <custom-select
                                v-model="testCase.test"
                                :options="Object.keys(testOptions)"
                                class="mr-16 w-104 text-solstice-blue text-sm border-b border-telluric-blue-opacity-60"
                            >
                                <template v-slot:default="{option}">{{testOptions[option]}}</template>
                            </custom-select>
                            <sign-select v-model="testCase.operator" class="mr-16" />
                            <number-select v-model.number="testCase.value" :min="0" :max="8" class="mr-8" />
                            <div class="flex items-center text-solstice-blue" v-if="testCase.test === 'contains'">
                                <div>results</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="testCase.test === 'contains' && testCase.recordsMatching !== undefined">
                        <div v-if="testCase.recordsMatching.length > 0">
                            <div class="flex">
                                <div class="mx-auto border-l border-proton-grey h-12"></div>
                            </div>
                            <div class="flex">
                                <div class="mx-auto bg-moon-grey-opacity-50 border border-proton-grey px-8 py-4 rounded text-xs uppercase tracking-wide text-solstice-blue">
                                    where
                                </div>
                            </div>
                            <div class="flex">
                                <div class="mx-auto border-l border-proton-grey h-12"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex" v-for="(condition, j) in testCase.recordsMatching">
                                <requirement
                                    :condition="condition" :i="j" class="mx-auto"
                                    @onDelete="deleteRequirement(testCase.recordsMatching, j)"
                                />
                            </div>
                        </div>
                        <div>
                            <div class="flex">
                                <div class="mx-auto border-l border-proton-grey h-12"></div>
                            </div>
                            <div class="flex">
                                <button
                                    class="mx-auto bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                                    @click="addRequirement(testCase.recordsMatching)"
                                >
                                    Add requirement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        class="bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                        @click="addTest()"
                    >
                        Add Test
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import SearchIcon from "common/icons/search.svg";
    import Params from 'common/components/params/Params';
    import CustomSelect from "common/components/selectors/CustomSelect";
    import {algoliaParams} from "common/utils/algoliaHelpers";
    import SignSelect from "@/relevance-testing/SignSelect";
    import NumberSelect from "@/relevance-testing/NumberSelect";
    import Requirement from "@/relevance-testing/test-edit/Requirement";
    import TrashIcon from "common/icons/trash.svg";

    export default {
        name: 'TestEdit',
        props: ['test'],
        components: {Requirement, NumberSelect, SignSelect, Params, CustomSelect, TrashIcon, SearchIcon},
        data: function () {
            return {
                query: '',
                testOptions: {
                    'contains': 'page contains',
                    'nbHits': 'nbHits',
                },
                testData: null,
            }
        },
        created: function () {
            this.loadTest();
        },
        watch: {
            test: function () {
                this.loadTest();
            },
            testData: {
                deep: true,
                handler: function () {
                    this.saveTest();
                }
            },
            query: function () {
                this.saveTest();
            }
        },
        methods: {
            loadTest: function () {
                const copy = JSON.parse(JSON.stringify(this.test.testData));

                const searchParams = {};
                Object.keys(copy.when).forEach((key) => {
                    if (key === 'query') {
                        this.query = copy.when[key];
                    } else {
                        searchParams[key] = {value: copy.when[key], enabled: true};
                    }
                });

                copy.when = searchParams;
                this.testData = copy;
            },
            saveTest: function () {
                const params = algoliaParams(this.testData.when);
                params.query = this.query;

                this.test.updateTestData({
                    ...this.testData,
                    when: params,
                });
                this.$emit('onUpdatedTestData');
            },
            onSetParamValue: function (key, value) {
                this.$set(this.testData.when, key, {value: JSON.parse(JSON.stringify(value)), enabled: true});
            },
            onAddArrayElement: function (inputKey) {
                const newVal = JSON.parse(JSON.stringify(this.testData.when[inputKey].value));
                newVal.push('');
                this.onSetParamValue(inputKey, newVal);
            },
            onDeleteArrayElement: function (inputKey, positionKey) {
                this.$delete(this.testData.when[inputKey].value, positionKey);
            },
            onDeleteKey: function (inputKey) {
                this.$delete(this.testData.when, inputKey);
            },
            addRequirement: function (requirements) {
                requirements.push({
                    type: "attribute",
                    key: "objectID",
                    operator: "=",
                    value: ""
                });
            },
            deleteRequirement: function (requirements, i) {
                this.$delete(requirements, i);
            },
            deleteTest: function (tests, i) {
                this.$delete(tests, i);
            },
            addTest: function () {
                this.testData.then.push({
                    test: 'contains',
                    operator: '=',
                    value: 1,
                    recordsMatching: [
                        {
                            type: "attribute",
                            key: "objectID",
                            operator: "=",
                            value: ""
                        },
                    ]
                })
            }
        }
    }
</script>