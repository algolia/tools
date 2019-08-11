<template>
    <div>
        <div>
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-proton-grey bg-white p-8 bg-proton-grey-opacity-40">
                Description
            </div>
            <div class="px-8 py-12">
                {{testData.name}}
            </div>
        </div>
        <div>
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-t border-b border-proton-grey bg-white p-8 bg-proton-grey-opacity-40">
                When
            </div>
            <div class="px-8 py-12">
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
                    <div class="flex my-8 text-xs text-cosmos-black-opacity-70 uppercase tracking-wide pb-4 border-b border-proton-grey-opacity-20">
                        <div>
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
        components: {Requirement, NumberSelect, SignSelect, Params, CustomSelect, TrashIcon},
        data: function () {
            const copy = JSON.parse(JSON.stringify(this.test.testData));
            copy.when = this.editableObject(copy.when);
            return {
                testOptions: {
                    'contains': 'page contains',
                    'nbHits': 'nbHits',
                },
                testData: copy,
            }
        },
        watch: {
            test: function () {
                const copy = JSON.parse(JSON.stringify(this.test.testData));
                copy.when = this.editableObject(copy.when);
                this.testData = copy;
            },
            testData: {
                immediate: true,
                deep: true,
                handler: function () {
                    this.test.updateTestData({
                        ...this.testData,
                        when: algoliaParams(this.testData.when)
                    });
                    this.$emit('onUpdatedTestData');
                }
            }
        },
        methods: {
            editableObject: function (obj) {
                const editableObject = {};
                Object.keys(obj).forEach((key) => {
                    editableObject[key] = {value: obj[key], enabled: true};
                });
                return editableObject;
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