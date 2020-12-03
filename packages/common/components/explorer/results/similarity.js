import {getCriterionValue} from "../../../utils/rankingInfo";

function buildRankingVector(item, weights) {
    let ret = [];
    ["typo", "geo", "words", "filters", "proximity", "attribute", "exact"].forEach((criterionName) => {

        // for attributes we need the original value from the engine
        const val = criterionName == "attribute" ? item._rankingInfo.firstMatchedWord :  getCriterionValue(item, criterionName);

        if (Number.isInteger(val)) {
            // adding weight to the criteria to have a weighted cosine similarity
            ret.push((weights[criterionName] || 0) * val)
        }
    });
    return ret;
}

function cosinesime(A, B) {
    let dotproduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < A.length; i++) {
        dotproduct += A[i] * B[i];
        mA += A[i] * A[i];
        mB += B[i] * B[i];
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    let similarity = dotproduct / (mA * mB);

    if (similarity === 1) return similarity;

    return similarity.toFixed(3);
}

export default function getSimilarity(item, firstItem, weights) {
    const actualvec = buildRankingVector(item, weights);
    const ref = buildRankingVector(firstItem, weights);
    return cosinesime(ref, actualvec);
};
