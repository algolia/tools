import {getRaw} from 'common/utils/objectHelpers';
import {getCriterionValue} from 'common/utils/rankingInfo';
import {getSearchIndex} from 'common/utils/algoliaHelpers';
import Vue from 'vue';

export class TestSuite {
    constructor(testSuiteData) {
        this.id = testSuiteData.id;
        this.runs = testSuiteData.runs;
        this.name = testSuiteData.name;
        this.groups = testSuiteData.groups.map((g) => new GroupTest(g, this.runs, this));
        this.reports = {};
    }

    updateReport(i) {
        let nbTests = 0;
        let nbPassing = 0;
        this.groups.forEach((group) => {
            nbTests += group.reports[i].nbTests;
            nbPassing += group.reports[i].nbPassing;
        });
        const passing = nbPassing === nbTests;
        Vue.set(this.reports, i, {passing, nbPassing, nbTests});
    }

    async run() {
        this.reports = {};

        const promises = this.groups.map((group) => {
            return group.run();
        });

        await Promise.all(promises);
        this.runs.forEach((run, i) => this.updateReport(i));
    }

    async runRun(runData, i) {
        Vue.set(this.reports, i, undefined);

        const promises = this.groups.map((group) => {
            return group.runRun(runData, i);
        });
        await Promise.all(promises);

        this.updateReport(i);
    }
}

export class GroupTest {
    constructor(groupData, runs, suite) {
        this.id = groupData.id;
        this.name = groupData.name;
        this.runs = runs;
        this.suite = suite;

        if (groupData.tests) {
            this.tests = groupData.tests.map((t) => new Test(t, runs, this));
        }

        this.reports = {};
    }

    updateReport(i, updateSuite) {
        const nbPassing = this.tests.filter((test) => {
            return test.reports[i].passing;
        }).length;
        const nbTests = this.tests.length;
        const passing = nbPassing === nbTests;
        Vue.set(this.reports, i, {passing, nbPassing, nbTests});

        if (updateSuite) {
            this.suite.updateReport(i);
        }
    }

    async run() {
        this.reports = {};

        const promises = this.tests.map((test) => {
            return test.run();
        });
        await Promise.all(promises);

        this.runs.forEach((run, i) => this.updateReport(i));
    }

    async runRun(runData, i) {
        Vue.set(this.reports, i, undefined);

        const promises = this.tests.map((test) => {
            return test.runRun(runData, i);
        });

        await Promise.all(promises);
        this.updateReport(i);
    }
}

export class Test {
    constructor(testData, runs, group) {
        this.id = testData.id;
        this.runs = runs;
        this.group = group;
        this.testData = JSON.parse(testData.test_data);
        this.reports = {};
    }

    updateTestData(testData) {
        this.testData = testData;
    }

    static compare(a, operator, b) {
        if (operator === '=') {
            if (Array.isArray(a)) return a.indexOf(b) !== -1;
            return a === b;
        } else if (operator === '!=') {
            if (Array.isArray(a)) return a.indexOf(b) === -1;
            return a !== b;
        } else if (operator === '>') {
            return a > b;
        } else if (operator === '>=') {
            return a >= b;
        } else if (operator === '<') {
            return a < b;
        } else if (operator === '<=') {
            return a >= b;
        }
    }

    static meetCondition(hit, condition, res) {
        if (condition.type === 'attribute') {
            return Test.compare(getRaw(hit, condition.key, null), condition.operator, condition.value);
        } else if (condition.type === 'position') {
            return Test.compare(hit.__index__, condition.operator, condition.value);
        } else if (condition.type === 'rankingInfo') {
            return Test.compare(getCriterionValue(hit, condition.key), condition.operator, condition.value);
        } else if (condition.type === 'beforeFirstRecordMatching') {
            const matchingRecords = Test.findMatchingRecords(condition.value);
            if (matchingRecords.length > 0) {
                const pos = res.hits.findIndex((hit) => matchingRecords[0].objectID === hit.objectID);
                return hit.__index__ < pos;
            }
        } else if (condition.type === 'afterFirstRecordMatching') {
            const matchingRecords = Test.findMatchingRecords(condition.value);
            if (matchingRecords.length > 0) {
                const pos = res.hits.findIndex((hit) => matchingRecords[0].objectID === hit.objectID);
                return hit.__index__ > pos;
            }
        }

        throw new Error(`invalid condition type: ${condition.type}`);
    }

    static findMatchingRecords(hits, matchingRecordsConditions) {
        return hits.filter((hit) => {
            return matchingRecordsConditions.every((condition) => {
                return Test.meetCondition(hit, condition);
            });
        });
    }

    async run(updateGroup) {
        const promises = this.runs.map((run, i) => {
            return this.runRun(run, i);
        });
        await Promise.all(promises);

        if (updateGroup) {
            this.runs.forEach((run, runIndex) => this.group.updateReport(runIndex, true));
        }
    }

    async runRun(runData, runIndex) {
        Vue.set(this.reports, runIndex, undefined);

        const algoliaIndex = await getSearchIndex(runData.app_id, runData.api_key, runData.index_name);
        const res = await algoliaIndex.search({
            ...this.testData.when,
            hitsPerPage: runData.hitsPerPage,
            getRankingInfo: true,
            analytics: false,
        });

        res.hits.forEach((hit, i) => {
            hit.__index__ = i;
        });

        const report = {
            passing: true,
            then: [],
        };

        this.testData.then.forEach((testCase) => {
            const thenReport = {
                passing: null,
                recordsMatching: [],
            };

            if (testCase.test === 'nbHits') {
                thenReport.passing = Test.compare(res.nbHits, testCase.operator, testCase.value);
            }

            if (testCase.test === 'contains') {
                let recordsMatching = res.hits;
                let previousMatch = true;

                for (let i = 0; i < testCase.recordsMatching.length; i++) {
                    if (!previousMatch) {
                        thenReport.recordsMatching.push({passing: null});
                        continue;
                    }

                    recordsMatching = recordsMatching.filter((hit) => {
                        return Test.meetCondition(hit, testCase.recordsMatching[i]);
                    });

                    const conditionPassing = Test.compare(recordsMatching.length, testCase.operator, testCase.value);
                    thenReport.recordsMatching.push({passing: conditionPassing});

                    previousMatch = conditionPassing;
                }

                thenReport.passing = Test.compare(recordsMatching.length, testCase.operator, testCase.value);
            }

            report.then.push(thenReport);
            report.passing = report.passing && thenReport.passing;
        });

        Vue.set(this.reports, runIndex, report);
    }
}