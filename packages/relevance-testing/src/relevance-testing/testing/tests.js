import {get} from 'common/utils/objectHelpers';
import {getCriterionValue} from 'common/utils/rankingInfo';

export class TestSuite {
    constructor(testSuiteData) {
        this.passing = null;
        this.name = testSuiteData.name;
        this.groups = testSuiteData.groups.map((g) => new GroupTest(g));
    }

    async run(algoliaIndex, hitsPerPage) {
        this.reset();
        const promises = [];
        this.groups.forEach((group) => {
            const promise = group.run(algoliaIndex, hitsPerPage);
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

    async run(algoliaIndex, hitsPerPage) {
        this.reset();
        const promises = [];
        this.tests.forEach((test) => {
            const promise = test.run(algoliaIndex, hitsPerPage);
            promises.push(promise);
        });
        await Promise.all(promises);
        this.passing = this.tests.every((test) => test.passing === true);
    }

    reset() {
        this.tests.forEach((test) => { test.reset() });
        this.passing = null;
    }
}

export class Test {
    constructor(testData) {
        this.passing = null;
        this.name = testData.name;
        this.testData = testData;
    }

    reset() {
        this.passing = null;
    }

    static compare(a, operator, b) {
        if (operator === '=') {
            return a === b;
        } else if (operator === '!=') {
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
            return Test.compare(get(hit, condition.key, null), condition.operator, condition.value);
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

    async run(algoliaIndex, hitsPerPage) {
        this.reset();
        const res = await algoliaIndex.search({
            ...this.testData.when,
            hitsPerPage: 1000,
            getRankingInfo: true,
        });

        res.hits.forEach((hit, i) => {
            hit.__index__ = i;
        });

        if (this.testData.should !== undefined) {
            const recordsMatching = Test.findMatchingRecords(res.hits, this.testData.recordsMatching);
            this.passing = recordsMatching.length > 0 && recordsMatching.every((record) => {
                return this.testData.should.every((condition) => {
                    return Test.meetCondition(record, condition, res);
                });
            });
        } else if (this.testData.firstPageContain !== undefined) {
            const recordsMatching = Test.findMatchingRecords(res.hits.slice(0, hitsPerPage), this.testData.recordsMatching);
            this.passing = Test.compare(recordsMatching.length, '>=', this.testData.firstPageContain);
        } else if (this.testData.nbhit !== undefined) {
            this.passing = Test.compare(res.nbHit, this.testData.nbhit.operator, this.testData.nbhit.value);
        }
    }
}