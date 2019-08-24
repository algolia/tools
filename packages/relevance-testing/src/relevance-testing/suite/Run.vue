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
                            <edit-group :group="group" :group-pos="groupPos" :suite="suite" />
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
                            <edit-test
                                :test="test"
                                :test-pos="testPos"
                                :suite="suite"
                                @onSelected="currentTestEdit = test"
                            />
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
                            :suite="suite"
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

    import EditGroup from "@/relevance-testing/suite/EditGroup";
    import TestEdition from "@/relevance-testing/suite/TestEdition";
    import TestPreview from "@/relevance-testing/suite/TestPreview";
    import EditRun from "@/relevance-testing/suite/EditRun";
    import EditTest from "@/relevance-testing/suite/EditTest";

    export default {
        name: 'Run',
        props: ['suite'],
        components: {
            EditTest,
            EditRun,
            TestPreview, TestEdition, EditGroup, Badge},
        data: function () {
            return {
                hitsPerPage: 8,
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
            addRun: async function () {
                const apps = Object.keys(this.$store.state.apps);
                const appId = apps.length > 0 ? apps[0] : null;

                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/runs`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        app_id: appId,
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