<template>
    <tbody>
        <tr class="bg-proton-grey-opacity-40">
            <td @click="collapse = !collapse">
                <edit-group :group="group" :group-pos="groupPos" :suite="suite" />
            </td>
            <td v-for="(run, runPos) in runs" :key="run.id">
                <div v-if="group.reports[runPos]" class="p-8 text-telluric-blue text-xs text-center">
                    <!--<badge class="mr-16" :passing="group.reports[i].passing" />-->
                    {{group.reports[runPos].nbPassing}} / {{group.reports[runPos].nbTests}}
                </div>
            </td>
        </tr>
        <template v-if="!collapse">
            <tr v-for="(test, testPos) in group.tests" :key="test.id" class="bg-white" :class="{'bg-nebula-blue-opacity-20': currentTest === test}">
                <td>
                    <edit-test
                        :test="test"
                        :test-pos="testPos"
                        :suite="suite"
                        @onSelected="$emit('onTestSelected', test)"
                    />
                </td>
                <td v-for="(run, runPos) in runs" :key="run.id">
                    <div class="flex items-center justify-center p-8">
                        <div
                            class="px-4 py-2 text-xs rounded leading-none"
                            :class="{
                                'bg-proton-grey': !test.reports[runPos] || test.reports[runPos].passing === null,
                                'bg-jupiter-6': test.reports[runPos] && test.reports[runPos].passing === true,
                                'bg-mars-1': test.reports[runPos] &&  test.reports[runPos].passing === false,
                                'text-white': test.reports[runPos] && test.reports[runPos].passing !== null
                            }"
                        >
                            <div v-if="!test.reports[runPos] || test.reports[runPos].passing === null">
                                Not runned
                            </div>
                            <div v-else>
                                {{test.reports[runPos].nbPassing}} / {{test.reports[runPos].nbTests}}
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
            <tr class="bg-moon-grey">
                <td>
                    <button
                        @click="addTest"
                        class="mt-8 mb-32 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                    >
                        Add test
                    </button>
                </td>
            </tr>
        </template>
    </tbody>
</template>

<script>
    import EditGroup from "@/relevance-testing/suite/EditGroup";
    import EditTest from "@/relevance-testing/suite/EditTest";
    import {Test} from "@/test-engine/engine";

    export default {
        name: 'Group',
        props: ['group', 'groupPos', 'runs', 'suite', 'currentTest'],
        components: {EditTest, EditGroup},
        data: function () {
            return {
                collapse: this.suite.groups.length > 1 && this.group.tests.length > 0,
            }
        },
        methods: {
            addTest: async function () {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${this.group.id}/tests`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        test_data: JSON.stringify({
                            name: `test ${this.group.tests.length + 1}`,
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
                const test = new Test(testData, this.suite.runs, this.group);
                this.group.tests.push(test);
                test.run();
            },
        }
    }
</script>