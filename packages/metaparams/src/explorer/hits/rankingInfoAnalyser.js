import {get} from 'common/utils/objectHelpers';
import paramsSpecs from 'common/utils/paramsSpecs'

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

    this.getCriteriaValue = function (item, criterion) {
        if (criterion === 'typo') {
            return item._rankingInfo.nbTypos;
        } else if (criterion === 'geo') {
            if (item._geoloc) {
                return item._rankingInfo.geoDistance * item._rankingInfo.geoPrecision;
            }
            return null;
        } else if (criterion === 'words') {
            return item._rankingInfo.words;
        } else if (criterion === 'filters') {
            return item._rankingInfo.filters;
        } else if (criterion === 'proximity') {
            return item._rankingInfo.proximityDistance;
        } else if (criterion === 'attribute') {
            return Math.floor(item._rankingInfo.firstMatchedWord / 1000.);
        } else if (criterion === 'position') {
            return (item._rankingInfo.firstMatchedWord % 1000) + 1;
        } else if (criterion === 'exact') {
            return item._rankingInfo.nbExactWords;
        } else if (criterion === 'perso') {
            if (item._rankingInfo && item._rankingInfo.personalization) {
                return item._rankingInfo.personalization.score
            }
            return null;
        } else {
            const attributeName = criterion.replace(/^(asc|desc)\((.*)\)$/, '$2');
            return get(item, attributeName, '<not present>');
        }
    };
}