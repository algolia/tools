const getValues = function (attribute) {
    if (Array.isArray(attribute)) {
        return attribute.map(getValues);
    }
    if (typeof attribute === 'object' && attribute.constructor === Object) {
        return Object.keys(attribute).map((key) => { getValues(attribute[key]) });
    }
    return attribute.toLowerCase();
};
const computePersoScoreForRecord = function (record, persoProfile) {
    let score = 0;

    persoProfile.forEach((facet) => {
        if (getValues(record[facet.facetName]).indexOf(facet.facetValue) !== -1) {
            score += facet.score;
        }
    });

    return Math.min(20, score);
};

export default {
    name: 'currentStrategy',
    transformRecordsForPerso: function (records, persoProfile, personalisationImpact) {
        const indexSize = records.length;

        return records.map((record, index) => {
            const bucketPosition = 20 - Math.floor(index * 20 / indexSize);
            const persoScore = computePersoScoreForRecord(record, persoProfile);
            const perso = personalisationImpact / 100 * persoScore + (1 - personalisationImpact / 100) * bucketPosition;

            return {
                ...record,
                bucketPosition,
                persoScore,
                perso,
            };
        });
    },
    sortsRecordsForPerso: function (records) {
        return [...records].sort((a, b) => { return b.perso - a.perso; });
    }
}