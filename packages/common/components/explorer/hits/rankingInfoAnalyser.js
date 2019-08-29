import {getCriterionValue} from 'common/utils/rankingInfo';
import paramsSpecs from 'common/params-specs';

export default function (indexSettings) {
    this.indexSettings = indexSettings;
    this.ranking = indexSettings.ranking ? indexSettings.ranking : paramsSpecs.ranking.settings_default;
    this.customRanking = indexSettings.customRanking ? indexSettings.customRanking : paramsSpecs.customRanking.default;

    this.isTypoStrict = function (searchParams) {
        if (searchParams && searchParams.typoTolerance !== undefined) return searchParams.typoTolerance === 'strict';
        return this.indexSettings.typoTolerance === 'strict';
    };

    this.getActualCriteria = function (searchParams) {
        const actualCriteria = [];

        const ranking = [...this.ranking];

        if (this.isTypoStrict(searchParams)) {
            ranking.sort((a, b) => {
                return (a === 'typo' ? -1 : 1);
            });
        }

        ranking.forEach((item) => {
            if (item === 'custom') {
                actualCriteria.push('perso');
                this.customRanking.forEach(function (attribute) {
                    actualCriteria.push(attribute);
                });
            } else if (item === 'attribute') {
                actualCriteria.push('attribute');
                actualCriteria.push('position');
            }
            else {
                actualCriteria.push(item);
            }
        });

        return actualCriteria;
    };

    this.getCriterionValue = function (item, criterion) {
        return getCriterionValue(item, criterion);
    };
}