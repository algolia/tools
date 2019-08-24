<template>
    <div class="flex">
        <div :class="{'w-30p': currentTestEdit}">
            <table class="w-full">
                <tr>
                    <td></td>
                    <td v-for="(run, i) in runs" class="bg-proton-grey-opacity-80">
                        <edit-run :suite="suite" :run="run" :run-position="i" />
                    </td>
                    <td class="h-1" v-if="currentTestEdit === null">
                        <div
                            class="ml-16 px-40 border border-dashed border-proton-grey flex items-center justify-center h-full cursor-pointer"
                            @click="addRun"
                        >
                            <div>
                                Add a run
                            </div>
                        </div>
                    </td>
                </tr>
                <template v-for="(group, groupPos) in suite.groups">
                    <tr class="bg-proton-grey-opacity-40">
                        <td>
                            <div class="p-8 text-telluric-blue text-xs uppercase tracking-wide">
                                <div>
                                    <edit-group
                                        v-if="currentGroupEdit === groupPos"
                                        :group="group"
                                        @stopEdit="currentGroupEdit = null"
                                    />
                                </div>
                                <div class="flex" v-if="currentGroupEdit !== groupPos">
                                    <div class="mr-16">
                                        {{group.name}}
                                    </div>
                                    <div
                                        @click="group.run()"
                                        class="ml-auto"
                                    >
                                        Run
                                    </div>
                                    <div @click="currentGroupEdit = groupPos">
                                        <edit-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                                    </div>
                                    <div @click="deleteGroup(group, groupPos)">
                                        <trash-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td v-for="(run, i) in runs">
                            <div v-if="group.reports[i]" class="p-8 text-telluric-blue text-xs text-center">
                                <!--<badge class="mr-16" :passing="group.reports[i].passing" />-->
                                {{group.reports[i].nbPassing}} / {{group.reports[i].nbTests}}
                            </div>
                        </td>
                    </tr>
                    <tr v-for="(test, testPos) in group.tests" class="bg-white" :class="{'bg-nebula-blue-opacity-20': currentTestEdit === test}">
                        <td>
                            <div class="flex p-8">
                                <div
                                    class="mr-16 hover:text-nebula-blue hover:underline cursor-pointer"
                                    @click="currentTestEdit = test"
                                >
                                    <div class="flex items-center">
                                        <div>query</div>
                                        <div class="ml-4 px-4 py-2 text-sm rounded leading-none bg-proton-grey-opacity-40">
                                            {{ test.testData.when.query ? test.testData.when.query : '&lt;empty&gt;'}}
                                        </div>
                                        <div v-if="Object.keys(test.testData.when).length > 1" class="ml-4">
                                            +{{Object.keys(test.testData.when).length - 1}} params
                                        </div>
                                    </div>
                                    <div v-if="test.testData.description" class="text-nova-grey">{{test.testData.description}}</div>
                                </div>
                                <div
                                    class="ml-auto"
                                    @click="test.run()"
                                >
                                    Run
                                </div>
                                <div @click="deleteTest(test, testPos)">
                                    <trash-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                                </div>
                            </div>
                        </td>
                        <td v-for="(run, i) in runs">
                            <div class="flex items-center justify-center p-8" @click="currentTest = test">
                                <badge :passing ="test.reports[i] ? test.reports[i].passing : null" />
                            </div>
                        </td>
                    </tr>
                    <tr class="bg-moon-grey">
                        <td>
                            <button
                                @click="addTest(group)"
                                class="mt-8 mb-32 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                            >
                                Add test
                            </button>
                        </td>
                    </tr>
                </template>
            </table>
            <div>
                <button
                    class="mt-8 mb-32 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                    @click="addGroup"
                >
                    Add Group
                </button>
            </div>
        </div>
        <div class="w-70p" v-if="currentTestEdit">
            <div class="rounded bg-white ml-16 border border-solid border-proton-grey-opacity-60">
                <div class="flex">
                    <div class="min-w-third max-w-third border-r border-proton-grey ">
                        <test-edition
                            :test="currentTestEdit"
                            :current-run="suite.runs[0]"
                            :current-run-index="0"
                            @onUpdatedTestData="updateTest"
                        />
                    </div>
                    <test-preview
                        :current-test="currentTestEdit"
                        :current-run="suite.runs[0]"
                        class="min-w-two-third max-w-two-third bg-white p-8"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    td {
        padding: 0;
    }
</style>

<script>

    import Badge from '@/relevance-testing/common/Badge';
    import {GroupTest, Test} from '@/test-engine/engine';

    import TrashIcon from 'common/icons/trash.svg';
    import EditIcon from 'common/icons/edit.svg';
    import EditGroup from "@/relevance-testing/suite/EditGroup";
    import TestEdition from "@/relevance-testing/suite/TestEdition";
    import TestPreview from "@/relevance-testing/suite/TestPreview";
    import EditRun from "@/relevance-testing/suite/EditRun";

    export default {
        name: 'Run',
        props: ['suite'],
        components: {
            EditRun,
            TestPreview, TestEdition, EditGroup, Badge, TrashIcon, EditIcon},
        data: function () {
            return {
                hitsPerPage: 8,
                currentGroupEdit: null,
                currentTestEdit: null,
            }
        },
        created: function () {
            this.suite.run();
        },
        computed: {
            runs: function () {
                if (this.currentTestEdit === null) {
                    return this.suite.runs;
                }
                if (this.suite.runs.length > 0){
                    return [this.suite.runs[0]];
                }
                return [];
            }
        },
        methods: {
            addGroup: async function () {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: `Group ${this.suite.groups.length + 1}`,
                    }),
                });

                const group = await res.json();
                this.suite.groups.push(new GroupTest(group, this.suite.runs, this.suite));
            },
            deleteGroup: async function (group, i) {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${group.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$delete(this.suite.groups, i);
            },
            deleteTest: async function (test, testPos) {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${test.group.id}/tests/${test.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$delete(test.group.tests, testPos);
            },
            addTest: async function (group) {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${group.id}/tests`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        test_data: JSON.stringify({
                            name: `test ${group.tests.length + 1}`,
                            when: {query: ""},
                            then: [
                                {
                                    test: "contains",
                                    operator: ">=",
                                    value: 1,
                                    recordsMatching: [
                                        {
                                            "type": "attribute",
                                            "key": "objectID",
                                            "operator": "=",
                                            "value": ""
                                        }
                                    ]
                                }
                            ]
                        }),
                    }),
                });

                const testData = await res.json();
                const test = new Test(testData, this.suite.runs, group);
                group.tests.push(test);
                test.run();
            },
            updateTest: async function () {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${this.currentTestEdit.group.id}/tests/${this.currentTestEdit.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        test_data: JSON.stringify(this.currentTestEdit.testData),
                    }),
                });

                this.currentTestEdit.run(true)
            },
            addRun: async function () {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/runs`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        app_id: null,
                        index_name: null,
                        hits_per_page: null,
                        params: '{}',
                    }),
                });

                const run = await res.json();
                run.params = JSON.parse(run.params);

                this.suite.runs.push(run);
            }
        }
    }
</script>