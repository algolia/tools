import {getRaw} from 'common/utils/objectHelpers';
import {getCriterionValue} from 'common/utils/rankingInfo';
import {getSearchIndex} from 'common/utils/algoliaHelpers';
import Vue from 'vue';
import {algoliaParams} from "common/utils/algoliaHelpers";

export class TestSuite {
    constructor(testSuiteData, fetchApiKey) {
        this.id = testSuiteData.id;
        this.runs = testSuiteData.runs;
        this.name = testSuiteData.name;
        this.fetchApiKey = fetchApiKey;
        this.groups = testSuiteData.groups.map((g) => new GroupTest(g, this.runs, this));
        this.reports = {};

        this.runs.forEach((run) => {
            run.params = JSON.parse(run.params);
        });
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
        let nbTests = 0;
        let nbPassing = 0;
        this.tests.forEach((test) => {
            if (test.reports[i]) {
                nbTests += test.reports[i].nbTests;
                nbPassing += test.reports[i].nbPassing;
            }
        });
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

    updateReport(i) {
        let nbTests = 0;
        let nbPassing = 0;

        this.reports[i].then.forEach((requirement) => {
            nbTests += 1;
            nbPassing += requirement.passing ? 1 : 0;
        });
        const passing = nbPassing === nbTests;
        Vue.set(this.reports[i], 'passing', passing);
        Vue.set(this.reports[i], 'nbPassing', nbPassing);
        Vue.set(this.reports[i], 'nbTests', nbTests);
    }

    static compare(recordValue, operator, refValue) {
        if (recordValue === undefined || recordValue === null) return false;

        if (operator === 'contains') {
            if (Array.isArray(recordValue)) return recordValue.some((v) => v.includes(refValue));
            return recordValue.includes(refValue);
        } else if (operator === 'notContains') {
            if (Array.isArray(recordValue)) return recordValue.every((v) => !v.includes(refValue));
            return !recordValue.includes(refValue);
        } else if (operator === 'is') {
            if (Array.isArray(recordValue)) return recordValue.includes(refValue);
            return recordValue === refValue;
        } else if (operator === 'isNot') {
            if (Array.isArray(recordValue)) return !recordValue.includes(refValue);
            return recordValue !== refValue;
        } else if (operator === 'isTrue') {
            return recordValue === true;
        } else if (operator === 'isFalse') {
            return recordValue === false;
        } else if (operator === 'isNull') {
            return recordValue === null;
        } else if (operator === '=') {
            if (Array.isArray(recordValue)) return recordValue.some((v) => v === parseFloat(refValue));
            return recordValue === parseFloat(refValue);
        } else if (operator === '!=') {
            if (Array.isArray(recordValue)) return recordValue.some((v) => v !== parseFloat(refValue));
            return recordValue !== parseFloat(refValue);
        } else if (operator === '>') {
            return recordValue > parseFloat(refValue);
        } else if (operator === '>=') {
            return recordValue >= parseFloat(refValue);
        } else if (operator === '<') {
            return recordValue < parseFloat(refValue);
        } else if (operator === '<=') {
            return recordValue <= parseFloat(refValue);
        }
    }

    static meetCondition(hit, condition, res) {
        if (condition.type === 'attribute') {
            return Test.compare(getRaw(hit, condition.key, null), condition.operator, condition.value);
        } else if (condition.type === 'position') {
            return Test.compare(hit.__index__, condition.operator, condition.value);
        } else if (condition.type === 'rankingInfo') {
            return Test.compare(getCriterionValue(hit, condition.key), condition.operator, condition.value);
        } else if (condition.type === 'is before') {
            const matchingRecords = Test.findMatchingRecords(res.hits, condition.value);

            if (matchingRecords.length > 0) {
                return hit.__index__ < matchingRecords[0].__index__;
            }
            return true;
        } else if (condition.type === 'is after') {
            const matchingRecords = Test.findMatchingRecords(res.hits, condition.value);
            if (matchingRecords.length > 0) {
                return hit.__index__ > matchingRecords[0].__index__;
            }
            return false;
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
        const promises = this.runs.map((run, runIndex) => {
            return this.runRun(run, runIndex);
        });
        await Promise.all(promises);

        if (updateGroup) {
            this.runs.forEach((run, runIndex) => this.group.updateReport(runIndex, true));
        }
    }

    async runRun(runData, runIndex) {
        Vue.set(this.reports, runIndex, undefined);

        const apiKey = this.group.suite.fetchApiKey(runData.app_id);

        if (!apiKey || !runData.index_name) return;

        const algoliaIndex = await getSearchIndex(runData.app_id, apiKey, runData.index_name);
        const params = Object.assign(
            {},
            this.testData.when,
            algoliaParams(runData.params),
            {
                hitsPerPage: runData.hits_per_page,
                getRankingInfo: true,
                analytics: false,
                enableABTest: false,
            }
        );
        const res = await algoliaIndex.customSearch(params);

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
                        return Test.meetCondition(hit, testCase.recordsMatching[i], res);
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
        this.updateReport(runIndex);
    }
}
