import {getCriterionValue} from 'common/utils/rankingInfo';
import paramsSpecs from 'common/params-specs';
import store from 'common/store/store';

export default function (indexSettings) {
    this.indexSettings = indexSettings;
    this.ranking = indexSettings.ranking ? indexSettings.ranking : paramsSpecs.ranking.settings_default;
    this.customRanking = indexSettings.customRanking ? indexSettings.customRanking : paramsSpecs.customRanking.default;

    this.isTypoStrictOrMin = function (searchParams) {
        if (searchParams && searchParams.typoTolerance !== undefined) {
            return ['strict', 'min'].indexOf(searchParams.typoTolerance) !== -1;
        }
        return ['strict', 'min'].indexOf(this.indexSettings.typoTolerance) !== -1;
    };

    this.getActualCriteria = function (searchParams, withoutCustom) {
        const actualCriteria = [];

        const ranking = [...this.ranking];

        if(searchParams.experimentalBucketingDebugging && searchParams.getRankingInfo){
            actualCriteria.push("similarity");
            actualCriteria.push("textualRelevanceBucket");
        }

        if (this.isTypoStrictOrMin(searchParams)) {
            actualCriteria.push('typo');
        }

        let foundCustom = false;

        ranking.forEach((item) => {
            if (item === 'custom') {
                if (withoutCustom) return;
                foundCustom = true;
                actualCriteria.push('perso');
                actualCriteria.push('perso.rankingScore');
                actualCriteria.push('perso.filtersScore');
                this.customRanking.forEach(function (attribute) {
                    actualCriteria.push(attribute);
                });
            } else if (item === 'typo') {
                if (actualCriteria.indexOf('typo') === -1) { // Might have been pushed already by typo min/strict
                    actualCriteria.push('typo');
                }
            } else if (item === 'attribute') {

                const attributeCriteriaComputedBy = this.indexSettings.attributeCriteriaComputedBy || searchParams.attributeCriteriaComputedBy;
                const isSumComputation = attributeCriteriaComputedBy === 'sum';

                if (!isSumComputation) {
                    actualCriteria.push('attribute');
                    actualCriteria.push('position');
                } else {
                    actualCriteria.push('attributeSum');
                }
            }
            else {
                actualCriteria.push(item);
            }
        });

        if (!foundCustom) {
            actualCriteria.push('perso');
            actualCriteria.push('perso.rankingScore');
            actualCriteria.push('perso.filtersScore');
        }

        return actualCriteria;
    };

    this.getCriterionValue = function (item, criterion) {
        return getCriterionValue(item, criterion);
    };

    this.getSimilarity = function (firstItem, currentHit, searchParams, appId, indexName) {
        const criteria = this.getActualCriteria(searchParams);
        const actualvec = this.buildRankingVector(criteria, currentHit, appId, indexName);
        const ref = this.buildRankingVector(criteria, firstItem, appId, indexName);
        return this.cosinesime(ref,actualvec);
    };

    this.buildRankingVector = function(criteria, item, appId, indexName){
        let ret = [];
        criteria.forEach((criterionName) => {
            if(["typo","geo","words","filters","proximity", "attribute", "exact"].includes(criterionName))
            {
                const val = this.getCriterionValue(item, criterionName);
                if (Number.isInteger(val))
                {
                    // adding weight to the criteria to have a weighted cosine similarity
                    ret.push(this.getCriterionWeight(criterionName, appId, indexName) * val)
                }
            }
        });
        return ret;
    };

    this.cosinesime = function (A,B) {
        let dotproduct=0;
        let mA=0;
        let mB=0;
        for(let i = 0; i < A.length; i++){
            dotproduct += (A[i] * B[i]);
            mA += (A[i]*A[i]);
            mB += (B[i]*B[i]);
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        let similarity = (dotproduct)/((mA)*(mB));

        if(similarity == 1){
            return similarity;
        }

        return similarity.toFixed(3);
    };

    this.getCriterionWeight =  function(criterion, appId, indexName){
        var weight = 0;
        switch (criterion) {
            case "typo":
                 weight = store.state.apps[appId][indexName]["weights"]["typo"];
                break;
            case "attributes":
                weight = store.state.apps[appId][indexName]["weights"]["attributes"];
                break;
            case "words":
                weight = store.state.apps[appId][indexName]["weights"]["words"];
                break;
            case "proximity":
                weight = store.state.apps[appId][indexName]["weights"]["proximity"];
                break;
            case "exact":
                weight = store.state.apps[appId][indexName]["weights"]["exact"];
                break;
            case "filters":
                weight = store.state.apps[appId][indexName]["weights"]["filters"];
                break;
            case "geo":
                weight = store.state.apps[appId][indexName]["weights"]["geo"];
                break;
            default:
                weight =0;
                break;
        }
        return weight;
    };
}
