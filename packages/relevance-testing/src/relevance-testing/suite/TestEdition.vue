<template>
    <div v-if="testData" class="p-8">
        <div v-for="(testCase, testCasePos) in testData.then" class="mb-32">
            <div class="text-telluric-blue text-xs uppercase tracking-wide bg-white p-8">
                <div class="flex">
                    <div class="text-xs text-cosmos-black-opacity-70 uppercase tracking-wide">
                        Test {{testCasePos + 1}}/{{testData.then.length}}
                    </div>
                    <badge v-if="test.reports[currentRunIndex]" :passing="test.reports[currentRunIndex].then[testCasePos].passing" class="ml-8 -mt-2" />
                    <trash-icon
                        class="ml-auto text-nova-grey-opacity-60 hover:text-telluric-blue w-12 h-12 cursor-pointer"
                        @click="deleteTest(testData.then, testCasePos)"
                    />
                </div>
            </div>
            <div class="flex mt-12">
                <div class="flex flex-wrap mx-auto bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 p-8 rounded">
                    <custom-select
                        v-model="testCase.test"
                        :options="Object.keys(testOptions)"
                        class="mr-16 w-104 text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
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
                <requirements
                    :requirements="testCase.recordsMatching"
                    :run-index="currentRunIndex"
                    :reports="test.reports[currentRunIndex] ? test.reports[currentRunIndex].then[testCasePos].recordsMatching : null"
                />
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
</template>

<script>
    import SearchIcon from "common/icons/search.svg";
    import Params from 'common/components/params/Params';
    import CustomSelect from "common/components/selectors/CustomSelect";
    import {algoliaParams} from "common/utils/algoliaHelpers";
    import SignSelect from "@/relevance-testing/common/SignSelect";
    import NumberSelect from "@/relevance-testing/common/NumberSelect";
    import TrashIcon from "common/icons/trash.svg";
    import Badge from "@/relevance-testing/common/Badge";
    import Requirements from "@/relevance-testing/suite/Requirements";

    export default {
        name: 'TestEdition',
        props: ['suite', 'test', 'currentRun', 'currentRunIndex'],
        components: {
            Requirements,
            Badge, NumberSelect, SignSelect, Params, CustomSelect, TrashIcon, SearchIcon},
        data: function () {
            return {
                testOptions: {
                    'contains': 'page contains',
                    'nbHits': 'nbHits',
                },
                testData: null,
                query: null,
                when: null,
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
            query: function () { this.saveTest(); },
            when: {
                deep: true,
                handler: function () { this.saveTest(); }
            },
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
                this.when = searchParams;
                this.testData = copy;
            },
            saveTest: async function () {
                const params = algoliaParams(this.when);
                params.query = this.query;

                this.test.updateTestData({
                    ...this.testData,
                    when: params,
                });

                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${this.test.group.id}/tests/${this.test.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        test_data: JSON.stringify(this.test.testData),
                    }),
                });

                this.test.run(true)
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
            },
        }
    }
</script>