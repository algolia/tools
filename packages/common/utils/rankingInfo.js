import {get} from "./objectHelpers";

export function getCriteria() {
    return [
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'position',
        'exact',
        'perso',
    ];
}

export function getCriterionValue(item, criterion) {
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
    } else if (criterion === 'attributeSum') {
        return item._rankingInfo.firstMatchedWord;
    } else if (criterion === 'position') {
        return (item._rankingInfo.firstMatchedWord % 1000) + 1;
    } else if (criterion === 'exact') {
        return item._rankingInfo.nbExactWords;
    } else if (criterion === 'textualRelevanceBucket') {
        return item._rankingInfo.textualRelevanceBucket;
    } else if (criterion === 'perso') {
        if (item._rankingInfo && item._rankingInfo.personalization) {
            return item._rankingInfo.personalization.score
        }
        return null;
    } else if (criterion === 'perso.filtersScore') {
        if (item._rankingInfo && item._rankingInfo.personalization) {
            return item._rankingInfo.personalization.filtersScore;
        }
        return null;
    } else if (criterion === 'perso.rankingScore') {
        if (item._rankingInfo && item._rankingInfo.personalization) {
            return item._rankingInfo.personalization.rankingScore
        }
        return null;
    } else {
        const attributeName = criterion.replace(/^(asc|desc)\((.*)\)$/, '$2');
        return get(item, attributeName, '<not present>');
    }
}
