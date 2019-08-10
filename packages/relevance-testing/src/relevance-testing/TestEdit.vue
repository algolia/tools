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
                <div v-for="(requirement, i) in testData.then" class="mb-64">
                    <div class="flex flex-wrap">
                        <select v-model="requirement.test" class="mr-8 w-108">
                            <option value="contains">page contains</option>
                            <option value="nbHits">nbHits</option>
                        </select>
                        <div v-if="requirement.test === 'nbHits'" class="mr-8 p-4">
                            should be
                        </div>
                        <sign-select v-model="requirement.operator" class="mr-8" />
                        <input type="number" class="input-custom p-4 w-108" v-model.number="requirement.value" />
                    </div>
                    <div class="ml-8 my-16 text-xs uppercase tracking-wide text-telluric-blue">which:</div>
                    <div
                        v-if="requirement.test === 'contains' && requirement.recordsMatching !== undefined"
                        class="ml-32 mr-8"
                    >
                        <div v-for="condition in requirement.recordsMatching" class="mb-16">
                            <div class="flex flex-wrap items-center">
                                <select class="mr-8 w-108" v-model="condition.type">
                                    <option>attribute</option>
                                    <option>position</option>
                                    <option>rankingInfo</option>
                                    <option>is before</option>
                                    <option>is after</option>
                                </select>
                                <input
                                    v-if="condition.type === 'attribute'"
                                    v-model="condition.key"
                                    class="input-custom mr-8 p-4 w-108"
                                />
                            </div>
                            <div class="flex flex-wrap items-center">
                                <sign-select v-model="condition.operator" class="mr-8 my-8" />
                                <input
                                    v-if="condition.type === 'attribute'"
                                    v-model="condition.value"
                                    class="input-custom p-4 w-108"
                                />
                                <input
                                    v-if="condition.type === 'position'"
                                    type="number"
                                    min="0"
                                    v-model.number="condition.value"
                                    class="input-custom p-4 w-108"
                                />
                            </div>
                        </div>
                        <button
                            class="bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            @click="addRequirement(requirement.recordsMatching)"
                        >
                            Add requirement
                        </button>
                    </div>
                </div>
                <div class="mt-48">
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
    import {algoliaParams} from "common/utils/algoliaHelpers";
    import SignSelect from "./SignSelect";

    export default {
        name: 'TestEdit',
        props: ['test'],
        components: {SignSelect, Params},
        data: function () {
            const copy = JSON.parse(JSON.stringify(this.test.testData));
            copy.when = this.editableObject(copy.when);
            return {
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