<template>
    <div class="h-full overflow-y-scroll">
        <div class="p-12">
            <div class="flex w-full mt-12">
                <div class="ml-16">
                    <table>
                        <tr>
                            <td class="align-middle">CSV Data</td>
                            <td class="pl-12">
                                <textarea
                                    v-model="rawCsv"
                                    class="p-8 input-custom"
                                    placeholder="Paste your CSV content"
                                ></textarea>
                            </td>
                        </tr>
                        <template>
                            <tr>
                                <td class="align-middle pt-8">Delimitor</td>
                                <td class="pl-12 pt-8">
                                    <select v-model="delimitor">
                                        <option value=",">,</option>
                                        <option value=";">;</option>
                                        <option value="\t">\t</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td class="align-middle pt-8">Ignore first line</td>
                                <td class="pl-12 pt-8"><input type="checkbox" v-model="ignoreFirstLine"></td>
                            </tr>
                        </template>
                    </table>
                    <table class="mt-12">
                        <tr v-if="columnTypes.length > 0" class="border border-proton-grey-opacity-60">
                            <td v-for="(type, i) in columnTypes" class="p-8 border border-proton-grey-opacity-60">
                               <select v-model="columnTypes[i]">
                                   <option value=""></option>
                                   <optgroup label="When">
                                       <option value="query">query</option>
                                       <option value="searchParams">searchParams</option>
                                       <option value="description">description</option>
                                   </optgroup>
                                   <optgroup label="Basic requirement">
                                       <option value="objectID">has objectID</option>
                                   </optgroup>
                                   <optgroup label="Position requirement">
                                       <option value="position">position value</option>
                                       <option value="positionOperator">position operator</option>
                                   </optgroup>
                                   <optgroup label="nbHits requirement">
                                       <option value="nbhitsCount">nbHits value</option>
                                       <option value="nbHitsOperator">nbHits operator</option>
                                   </optgroup>
                                   <optgroup label="Attribute requirement">
                                       <option value="contains">contains N</option>
                                       <option value="containsOperator">contains operator</option>
                                       <option value="attributeName">attribute name</option>
                                       <option value="operator">attribute operator</option>
                                       <option value="attributeValue">attribute value</option>
                                   </optgroup>
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
                if (this.rows.length > 0) {
                    const currentLength = this.columnTypes.length;
                    const lengthDiff = this.rows[0].length - currentLength;
                    this.columnTypes.length += lengthDiff;
                    for (let i = 0; i < lengthDiff; i++) {
                        this.columnTypes[currentLength + i] = '';
                    }
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
                    let searchParams = {};
                    let requirement = {
                        test: "contains",
                        operator: "=",
                        value: 1,
                        recordsMatching: [
                            {
                                type: "attribute",
                                key: "objectID",
                                operator: '=',
                                value: 'myObjectID',
                            },
                        ],
                    };
                    let nbHitsRequirement = {
                        test: "nbHits",
                        operator: "=",
                        value: 1,
                        recordsMatching: []
                    };
                    let positionRequirement = {
                        type: "position",
                        key: "position",
                        operator: "=",
                        value: 0,
                    };

                    let addRequirement = false;
                    let addNbHitsRequirement = false;
                    let addPositionRequirement = false;

                    this.columnTypes.forEach((columnType, i) => {
                        if (columnType === 'query') {
                            query = row[i] || '';
                        } else if (columnType === 'searchParams') {
                            try {
                                searchParams = JSON.parse(row[i]);
                            } catch (e) {
                                searchParams = {};
                            }
                        } else if (columnType === 'nbhitsCount') {
                            addNbHitsRequirement = true;
                            nbHitsRequirement.value = row[i];
                        } else if (columnType === 'nbhitsOperator') {
                            addNbHitsRequirement = true;
                            requirement.operator = row[i];
                        } else if (columnType === 'contains') {
                            addRequirement = true;
                            requirement.value = parseInt(row[i]);
                        } else if (columnType === 'containsOperator') {
                            addRequirement = true;
                            requirement.operator = row[i];
                        } else if (columnType === 'attributeName') {
                            addRequirement = true;
                            requirement.recordsMatching[0].key = row[i];
                        } else if (columnType === 'operator') {
                            addRequirement = true;
                            requirement.recordsMatching[0].operator = row[i];
                        } else if (columnType === 'attributeValue') {
                            addRequirement = true;
                            const parsedValue = parseFloat(row[i]);
                            const value = isNaN(parsedValue) ? row[i] : parsedValue;
                            requirement.recordsMatching[0].value = value;
                        } else if (columnType === 'objectID') {
                            then.push({
                                test: "contains",
                                operator: "=",
                                value: 1,
                                recordsMatching: [
                                    {
                                        type: "attribute",
                                        key: "objectID",
                                        operator: "is",
                                        value: row[i],
                                    },
                                ],
                            })
                        } else if (columnType === 'position') {
                            const value = parseFloat(row[i]);
                            if (!isNaN(value)) {
                                positionRequirement.value = value;
                                addPositionRequirement = true;
                            }
                        } else if (columnType === 'positionOperator') {
                            positionRequirement.operator = row[i];
                        } else if (columnType === 'description') {
                            description = row[i];
                        }
                    });

                    if (addRequirement) {
                        if (addPositionRequirement) {
                            requirement.recordsMatching.push(positionRequirement);
                        }
                        then.push(requirement);
                    }
                    if (addNbHitsRequirement) then.push(nbHitsRequirement);

                    if (query.length > 0 && queries[query]) {
                        queries[query].then.push(...then);
                    } else {
                        const test = {
                            description,
                            when: {
                                ...searchParams,
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
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${endpoint}/relevance-testing/suites/${this.suite.id}/groups`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: `Group ${this.suite.groups.length + 1}`,
                    }),
                });

                const groupData = await res.json();
                const group = new GroupTest(groupData, this.suite.runs, this.suite);
                this.suite.groups.push(group);

                let i, j, testsChunk, chunk = 1000;
                for (i = 0 , j = this.tests.length; i < j; i += chunk) {
                    testsChunk = this.tests.slice(i,i+chunk);
                    const res2 = await fetch(`${endpoint}/relevance-testing/suites/${this.suite.id}/groups/${groupData.id}/tests/batch`, {
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
                        group.tests.push(test);
                    });
                }
                group.run();

                this.rawCsv = '';
                this.$root.$emit('onClosePanel');
            }
        }
    }
</script>
