import {getCriterionValue} from 'common/utils/rankingInfo';
import paramsSpecs from 'common/params-specs';

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

    this.getActualCriteria = function (searchParams) {
        const actualCriteria = [];

        const ranking = [...this.ranking];

        if (this.isTypoStrictOrMin(searchParams)) {
            ranking.sort((a, b) => {
                return (a === 'typo' ? -1 : 1);
            });
        }

        let foundCustom = false;

        ranking.forEach((item) => {
            if (item === 'custom') {
                foundCustom = true;
                actualCriteria.push('perso');
                actualCriteria.push('perso.rankingScore');
                actualCriteria.push('perso.filtersScore');
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
}