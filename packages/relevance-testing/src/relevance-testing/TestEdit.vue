<template>
    <div class="rounded bg-white m-16 border border-solid border-proton-grey-opacity-60 w-25p">
        <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
            Edit
        </div>
        <div class="p-8">
            <div>
                <h3>Name of the test</h3>
                <div class="mt-16">
                    {{test.name}}
                </div>
            </div>
            <div class="mt-16">
                <h3>When</h3>
                <params
                    class="mt-16"
                    id="when"
                    config-key="searchParams"
                    :params="when"
                    :ref-params="when"
                    :raw-params="when"
                    :keys="Object.keys(when)"
                    :panelKeysIndexer="null"
                    @onSetParamValue="onSetParamValue"
                    @onAddArrayElement="onAddArrayElement"
                    @onDeleteArrayElement="onDeleteArrayElement"
                    @onDeleteKey="onDeleteKey"
                />
            </div>
            <div class="mt-16">
                <h3>Then</h3>
            </div>
            <div v-if="testData.firstPageContain" class="mt-16">
                <div>
                    First Page should contains {{testData.firstPageContain}} hits that:
                </div>
                <div>
                    <test-condition v-for="condition in testData.recordsMatching" :condition="condition" />
                </div>
            </div>
            <div v-if="testData.nbHits">
                There should be at least {{testData.nbHits}} hits
            </div>
            <div v-if="testData.should !== undefined">
                <div class="mt-16">All records that have:</div>
                <div>
                    <test-condition v-for="condition in testData.recordsMatching" :condition="condition" />
                </div>
                <div class="mt-16">Should</div>
                <div>
                    <test-condition v-for="condition in testData.should" :condition="condition" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Params from 'common/components/params/Params';
    import TestCondition from "@/relevance-testing/TestCondition";

    export default {
        name: 'TestEdit',
        props: ['test'],
        components: {TestCondition, Params},
        data: function () {
            return {
                when: this.editableObject(this.test.testData.when),
            }
        },
        watch: {
            test: function () {
                this.when = this.editableObject(this.test.testData.when);
            }
        },
        computed: {
            testData: function () {
                return this.test.testData;
            },
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
                this.$set(this.when, key, {value: JSON.parse(JSON.stringify(value)), enabled: true});
            },
            onAddArrayElement: function (inputKey) {
                const newVal = JSON.parse(JSON.stringify(this.when[inputKey].value));
                newVal.push('');
                this.onSetParamValue(inputKey, newVal);
            },
            onDeleteArrayElement: function (inputKey, positionKey) {
                this.$delete(this.when[inputKey].value, positionKey);
            },
            onDeleteKey: function (inputKey) {
                this.$delete(this.when, inputKey);
            },
        }
    }
</script>