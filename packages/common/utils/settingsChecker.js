const params = {
    searchableAttributes: [
        ['danger', 'nonConfiguredParam'],
        ['danger', 'toBigAttributeList', 64],
        ['danger', 'containsBoolean'],
        ['danger', 'toBigAttributeList', 30],
        ['warning', 'nonExistingAttribute'],
    ],
    customRanking: [
        ['danger', 'nonConfiguredParam'],
        ['warning', 'nonExistingAttribute'],
    ],
    ranking: [
        ['danger', 'missingRankingCriteria'],
        ['danger', 'containsNonBooleanOrNumeric'],
        ['warning', 'nonExistingAttribute'],
    ],
    minWordSizefor1Typo: [
        ['danger', 'integerComp', '<=', 2],
        ['danger', 'integerComp', '>=', 8],
    ],
    minWordSizefor2Typos: [
        ['danger', 'integerComp', '<=', 4],
        ['danger', 'integerComp', '>=', 14],
    ],
    attributeForDistinct: [
        ['danger', 'containsBoolean'],
        ['warning', 'nonExistingAttribute'],
    ],
    distinct: [
        ['danger', 'integerComp', '>=', 5],
    ],
    attributesForFaceting: [
        ['warning', 'nonExistingAttribute'],
        ['danger', 'toBigAttributeList', 40],
    ],
    attributesToSnippet: [
        ['warning', 'nonExistingAttribute'],
        ['warning', 'containsBoolean'],
        ['warning', 'containsNumeric'],
    ],
    replicas: [
        ['danger', 'integerComp', '>=', 10],
    ],
    attributesToRetrieve: [
        ['warning', 'nonExistingAttribute'],
    ],
    attributesToHighlight: [
        ['warning', 'nonExistingAttribute'],
    ],
    /*decompoundedAttributes: [
        ['warning', 'attributeNotInParam', 'searchableAttributes'],
    ],*/
    disableTypoToleranceOnAttributes: [
        ['warning', 'attributeNotInParam', 'searchableAttributes'],
    ]
};

function cleanAttribute(attr) {
    let tmp = null;
    while (attr !== tmp) {
        tmp = attr;
        attr = attr
            .replace(/^\s*/, '')
            .replace(/\s*$/, '')
            .replace(/^[^(]*\((.*)\)[^)]*$/, '$1')
            .replace(/^(.*):[0-9]+?$/, '$1');
    }
    return attr.split(',');
}

const Report = function (severity, message) {
    this.severity = severity;
    this.message = message;
};

const SettingsChecker = function() {
    this.reports = [];

    this.getParamValue = function (key) {
        if (this.searchParams[key] !== undefined) return this.searchParams[key];
        if (key === 'searchableAttributes') {
            return this.indexSettings[key] || this.indexSettings.attributesToIndex;
        }
        return this.indexSettings[key];
    };

    this.getParamAttributeList = function (key) {
        let value = this.getParamValue(key) || [];

        if (value && typeof value === 'object' && value.constructor === Object) {
            value = Object.values(value).flat();
        }

        if (!Array.isArray(value)) value = [value];

        const array = value.map(cleanAttribute).flat();

        if (key === 'ranking') {
            const criteria = ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'];
            return array.filter((elt) => {
                return criteria.indexOf(elt) === -1;
            });
        }

        return array;
    };

    this.computeReports = function (indexAnalyzer, indexSettings, searchParams) {
        this.indexAnalyzer = indexAnalyzer;
        this.indexSettings = indexSettings;
        this.searchParams = searchParams;

        this.reports = [];
        let settingName;
        for (settingName in params) {
            const checks = params[settingName];
            checks.forEach((check) => {
                const [severity, checkFunction, ...args] = check;
                this[checkFunction](settingName, severity, ...args);
            });
        }
    };

    this.toBigAttributeList = function (forParam, severity, maxSize) {
        const attributesList = this.getParamAttributeList(forParam);

        if (attributesList.length >= maxSize) {
            this.reports.push(new Report(
                severity,
                `It's recommended not to have more than <code>${maxSize}</code> for ${forParam}`
            ));
        }
    };

    this.missingRankingCriteria = function (forParam, severity) {
        let ranking = this.indexSettings.ranking;
        if (!ranking) return; // We have the default ranking formula

        let criteria = {
            typo: '<code>ranking</code>:Removing <code>typo</code> means that the number of typos won\'t be taken into account in the ranking.',
            words: '<code>ranking</code>The rule <code>words</code> is applied when some query words are optional to rank the results by number of words matched',
            proximity: '<code>ranking</code>:<code>proximity</code> ranks results by the proximity of words matched in the records. Removing it harms the relevance in most cases.',
            attribute: '<code>ranking</code>:<code>attribute</code> takes into account where the words match in the list of <code>searchableAttributes</code>. Removing it harms the relevance in most cases.',
            exact: '<code>ranking</code>:<code>exact</code> ranks higher results where the query words match exactly (no prefix)',
            custom: '<code>ranking</code>:<code>custom</code> enables the <code>customRanking</code> to be taken into account.',
        };

        for (let criterion in criteria) {
            if (ranking.indexOf(criterion) === -1) {
                this.reports.push(new Report(
                    severity,
                    criteria[criterion]
                ));
            }
        }
    };

    this.integerComp = function (forParam, severity, operator, value) {
        const currentVal = this.getParamValue(forParam);

        if ((operator === '<=' && currentVal <= value) || (operator === '>=' && currentVal >= value)) {
            this.reports.push(new Report(
                severity,
                `It's recommended not to have <code>${forParam}</code> ${operator} ${value}`
            ));
        }
    };

    this.nonConfiguredParam = function (forParam, severity) {
        const paramValue = this.getParamValue(forParam);
        if (!Array.isArray(paramValue) || paramValue.length <= 0) {
            this.reports.push(new Report(
                severity,
                `Non configured ${forParam}`
            ));
        }
    };

    this.containsBoolean = function (forParam, severity) {
        this.containsType(forParam, severity, (v) => {return typeof v === 'boolean'}, 'boolean');
    };

    this.containsNumeric = function (forParam, severity) {
        this.containsType(forParam, severity, (v) => {return typeof v === 'number'}, 'numeric');
    };

    this.containsNonBooleanOrNumeric = function (forParam, severity) {
        this.containsType(
            forParam,
            severity,
            (v) => {return !(typeof v === 'number') && !(typeof v === 'boolean')},
            'numeric'
        );
    };

    this.containsType = function (forParam, severity, typeCheckFunc, type_label) {
        const attributesList = this.getParamAttributeList(forParam);
        const flattenRecord = this.indexAnalyzer.flattenRecord;

        for (let i = 0; i < attributesList.length; i++) {
            const attributeValues = flattenRecord[attributesList[i]];

            if (attributeValues !== undefined) {
                for (let j = 0; j < attributeValues.length; j++) {
                    if (typeCheckFunc(attributeValues[j])) {
                        this.reports.push(new Report(
                            severity,
                            `Some records contains ${type_label} values in attribute ${attributesList[i]} and param ${forParam}`
                        ));
                        return;
                    }
                }
            }
        }
    };

    this.attributeNotInParam = function(forParam, severity, inParamName) {
        const forParamValues = this.getParamAttributeList(forParam);
        const inParamsValues = this.getParamAttributeList(inParamName);

        for (let i = 0; i < forParamValues.length; i++) {
            if (inParamsValues.indexOf(forParamValues[i]) === -1) {
                this.reports.push(new Report(
                    severity,
                    `<code>${forParamValues[i]}</code> is in ${forParam} and should also be in ${inParamName}`
                ));
            }
        }
    };

    this.nonExistingAttribute = function (forParam, severity) {
        let attributesList = this.getParamAttributeList(forParam);
        if (!Array.isArray(attributesList)) attributesList = [attributesList];


        attributesList.forEach((attributeName) => {
            if (this.indexAnalyzer.keys.indexOf(attributeName) === -1) {
                this.reports.push(new Report(
                    severity,
                    `Unknown attribute ${attributeName} in <code>${forParam}</code>. <code>${attributeName}</code> was not found in a small sample of your records; there might be a typo.`
                ));
            }
        });
    };
};

export default SettingsChecker;