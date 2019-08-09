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
                <div v-for="(requirement, i) in testData.then">
                    <div v-if="i > 0" class="my-16">AND</div>
                    <div class="flex flex-wrap">
                        <select v-model="requirement.test" class="mr-8">
                            <option value="contains">page contains</option>
                            <option value="nbHits">nbHits</option>
                        </select>
                        <div v-if="requirement.test === 'nbHits'" class="mr-8 p-4">
                            should be
                        </div>
                        <select v-model="requirement.operator" class="mr-8">
                            <option value="=">(=) exactly</option>
                            <option value="!=">(!=) not be equal to </option>
                            <option value=">">(&gt;) more than</option>
                            <option value=">=">(&gt;=) at least</option>
                            <option value="<">(&lt;) less than</option>
                            <option value="<=">(&lt;=) maximum</option>
                        </select>
                        <input type="number" class="input-custom p-4" v-model="requirement.value" />
                    </div>
                    <div v-if="requirement.test === 'contains' && requirement.recordsMatching !== undefined">
                        <div>That:</div>
                        <test-condition v-for="condition in requirement.recordsMatching" :condition="condition" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Params from 'common/components/params/Params';
    import TestCondition from "@/relevance-testing/TestCondition";
    import {algoliaParams} from "common/utils/algoliaHelpers";

    export default {
        name: 'TestEdit',
        props: ['test'],
        components: {TestCondition, Params},
        data: function () {
            const copy = JSON.parse(JSON.stringify(this.test.testData));
            copy.when = this.editableObject(copy.when);
            return {
                testData: copy,
            }
        },
        watch: {
            test: function () {
                const copy = JSON.parse(JSON.stringify(this.testData));
                copy.when = this.editableObject(copy.when);
                this.when = this.editableObject(this.testData.when);
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
        }
    }
</script>