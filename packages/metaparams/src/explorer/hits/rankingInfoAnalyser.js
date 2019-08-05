import {getCriterionValue} from 'common/utils/rankingInfo';
import paramsSpecs from 'common/params-specs';

export default function (indexSettings) {
    this.indexSettings = indexSettings;
    this.ranking = indexSettings.ranking ? indexSettings.ranking : paramsSpecs.ranking.settings_default;
    this.customRanking = indexSettings.customRanking ? indexSettings.customRanking : paramsSpecs.customRanking.default;

    this.getActualCriteria = function () {
        const actualCriteria = [];

        this.ranking.forEach((item) => {
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