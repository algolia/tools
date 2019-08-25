<template>
    <div>
        <div class="flex">
            <div>
                <div>
                    Delimitor: <select v-model="delimitor">
                    <option value=",">,</option>
                    <option value=";">;</option>
                    <option value="\t">\t</option>
                </select>
                </div>
                <div>
                    Ignore first line: <input type="checkbox" v-model="ignoreFirstLine">
                </div>
                <textarea v-model="rawCsv"></textarea>
            </div>
            <div>
                <table>
                    <tr v-if="columnTypes.length > 0" class="border border-proton-grey-opacity-60">
                        <td v-for="(type, i) in columnTypes" class="p-8 border border-proton-grey-opacity-60">
                           <select v-model="columnTypes[i]">
                               <option value=""></option>
                               <option value="query">query</option>
                               <option value="objectID">objectID</option>
                               <option value="position">position</option>
                               <option value="description">description</option>
                           </select>
                        </td>
                    </tr>
                    <tr v-for="row in rows" class="border border-proton-grey-opacity-60">
                        <td v-for="column in row" class="p-8 border border-proton-grey-opacity-60">
                            {{column}}
                        </td>
                    </tr>
                </table>
            </div>
            <div v-if="tests.length > 0" class="ml-16">
                <button
                    @click="createGroupWithTests"
                    class="mb-32 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                >
                    Create group with the following tests
                </button>
                <pre>{{JSON.stringify(tests, null, 2)}}</pre>
            </div>
        </div>

    </div>
</template>

<script>
    import {dsvFormat} from 'd3-dsv';
    import {GroupTest, Test} from "@/test-engine/engine";

    export default {
        name: 'GroupGeneratorFromCsv',
        props: ['suite'],
        data: function () {
            return {
                rawCsv: '',
                delimitor: ',',
                ignoreFirstLine: false,
                columnTypes: [],
            }
        },
        watch: {
            rows: function () {
                this.columnTypes = [];
                if (this.rows.length > 0) {
                    this.rows[0].forEach(() => {
                        this.columnTypes.push('');
                    })
                }
            }
        },
        computed: {
            rows: function () {
                const rows = dsvFormat(this.delimitor).parseRows(this.rawCsv).map((row) => {
                    return row.map((column) => {
                        return column.trim();
                    })
                });

                if (this.ignoreFirstLine) {
                    return rows.slice(1);
                }

                return rows;
            },
            tests: function () {
                const queries = {};
                const tests = [];

                this.rows.forEach((row) => {
                    let description = '';
                    let query = '';
                    let then = [];

                    this.columnTypes.forEach((columnType, i) => {
                        if (columnType === 'query') {
                            query = row[i];
                        } else if (columnType === 'objectID') {
                            then.push({
                                test: "contains",
                                operator: "=",
                                value: 1,
                                recordsMatching: [
                                    {
                                        type: "attribute",
                                        key: "objectID",
                                        operator: "=",
                                        value: row[i],
                                    },
                                ],
                            })
                        } else if (columnType === 'position') {
                            then.push({
                                test: "contains",
                                operator: "=",
                                value: 1,
                                recordsMatching: [
                                    {
                                        type: "attribute",
                                        key: "position",
                                        operator: "=",
                                        value: row[i],
                                    },
                                ],
                            })
                        } else if (columnType === 'description') {
                            description = row[i];
                        }
                    });

                    if (query.length > 0 && queries[query]) {
                        queries[query].then.push(...then);
                    } else {
                        const test = {
                            description,
                            when: {
                                query
                            },
                            then
                        };
                        queries[query] = test;
                        tests.push(test);
                    }
                });

                return tests;
            }
        },
        methods: {
            createGroupWithTests: async function () {
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
                const groupTest = new GroupTest(group, this.suite.runs, this.suite);
                this.suite.groups.push(groupTest);

                let i, j, testsChunk, chunk = 10;
                for (i = 0 , j = this.tests.length; i < j; i += chunk) {
                    testsChunk = this.tests.slice(i,i+chunk);
                    const res2 = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${group.id}/tests/batch`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            tests: testsChunk.map((t) => JSON.stringify(t)),
                        }),
                    });

                    const testsData = await res2.json();
                    testsData.forEach((testData) => {
                        const test = new Test(testData, this.suite.runs, group);
                        groupTest.tests.push(test);
                        test.run();
                    });
                }

            }
        }
    }
</script>