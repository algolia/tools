import {getRaw} from 'common/utils/objectHelpers';
import {getCriterionValue} from 'common/utils/rankingInfo';
import {getSearchIndex} from 'common/utils/algoliaHelpers';
import Vue from 'vue';

export class TestSuite {
    constructor(testSuiteData) {
        this.passing = null;

        this.name = testSuiteData.name;
        this.groups = testSuiteData.groups.map((g) => new GroupTest(g));
    }

    async run(appId, apiKey, indexName, hitsPerPage) {
        this.reset();
        const promises = [];
        this.groups.forEach((group) => {
            const promise = group.run(appId, apiKey, indexName, hitsPerPage);
            promises.push(promise);
        });
        await Promise.all(promises);
        this.passing = this.groups.every((group) => group.passing === true);
    }

    reset() {
        this.passing = null;
        this.groups.forEach((group) => { group.reset(); });
    }
}

export class GroupTest {
    constructor(groupData) {
        this.passing = null;
        this.name = groupData.name;
        this.tests = groupData.tests.map((t) => new Test(t));
    }

    async run(appId, apiKey, indexName, hitsPerPage) {
        this.reset();
        const promises = [];
        this.tests.forEach((test) => {
            const promise = test.run(appId, apiKey, indexName, hitsPerPage);
            promises.push(promise);
        });
        await Promise.all(promises);
        this.passing = this.tests.every((test) => test.report.passing === true);
    }

    reset() {
        this.tests.forEach((test) => { test.reset() });
        this.passing = null;
    }
}

export class Test {
    constructor(testData) {
        this.report = { passing: null };
        this.testData = testData;
    }

    updateTestData(testData) {
        this.testData = testData;
    }

    reset() {
        this.report = { passing: null };
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

    async run(appId, apiKey, indexName, hitsPerPage) {
        this.reset();
        const algoliaIndex = await getSearchIndex(appId, apiKey, indexName);
        const res = await algoliaIndex.search({
            ...this.testData.when,
            hitsPerPage: hitsPerPage,
            getRankingInfo: true,
            analytics: false,
        });

        res.hits.forEach((hit, i) => {
            hit.__index__ = i;
        });

        let passing = true;

        Vue.set(this.report, 'then', []);
        this.testData.then.forEach((testCase) => {
            let thenPassing = true;
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
            this.report.then.push(thenReport);

            passing = passing && thenPassing;
        });

        Vue.set(this.report, 'passing', passing);
    }
}