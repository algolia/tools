import {get} from 'common/utils/objectHelpers';
import {getCriterionValue} from 'common/utils/rankingInfo';

class Test {
    constructor(testData) {
        this.passing = null;
        this.testData = testData;
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

    static findMatchingRecords(res, matchingRecordsConditions) {
        return res.hits.filter((hit) => {
            return matchingRecordsConditions.every((condition) => {
                return Test.meetCondition(hit, condition);
            });
        });
    }

    async run(algoliaIndex, hitsPerPage) {
        const res = await algoliaIndex.search({
            ...this.testData.when,
            hitsPerPage: 1000,
            getRankingInfo: true,
        });

        res.hits.forEach((hit, i) => {
            hit.__index__ = i;
        });

        const recordsMatching = Test.findMatchingRecords(res, this.testData.recordsMatching);

        this.passing = recordsMatching.every((record) => {
            return this.testData.should.every((condition) => {
                return Test.meetCondition(record, condition, res);
            });
        });
    }
}