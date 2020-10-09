function formatFilters(filters) {
    return filters.map((filter) => {
        if (typeof filter === 'string' || filter instanceof String) {
            const matches = 'language'.match(/([^<]*)(?:<score=(.*?)>)?/);

            const filterFormatted = {};
            filterFormatted.facet = matches[1];
            if (matches[2] !== undefined) {
                filterFormatted.score = parseInt(matches[2]);
            } else {
                filterFormatted.score = 1;
            }
            filterFormatted.disjunctive = false;

            return filterFormatted;
        }

        return filter;
    });
}

function extractParamsWithoutSpecial(rule) {
    const params = rule.consequence.params || {};
    const {query, automaticFacetFilters, automaticOptionalFacetFilters, ...paramsWithoutSpecial} = params;

    if (Object.keys(paramsWithoutSpecial).length <= 0) return {};

    return paramsWithoutSpecial;
}

function extractReplacedWordsFromQuery(rule) {
    const params = rule.consequence.params || {};
    const {query} = params;

    if (query && typeof query === 'object' && query.constructor === Object) {
        if (!query.edits) return [];

        const replacements = query.edits.filter((edit) => {
            return edit.type === 'replace';
        }).map((replace) => {
            return [replace.delete, replace.insert];
        });

        if (replacements.length > 0) return replacements;
    }

    return [];
}

function extractReplacedQuery(rule) {
    const params = rule.consequence.params || {};
    const {query} = params;

    if (typeof query === 'string' || query instanceof String) return query;

    return false;
}

function extractAutomaticOptionalFacetFilters(rule) {
    const params = rule.consequence.params || {};
    const {automaticOptionalFacetFilters} = params;
    return formatFilters(automaticOptionalFacetFilters || []);
}

function extractAutomaticFacetFilters(rule) {
    const params = rule.consequence.params || {};
    const {automaticFacetFilters} = params;
    return formatFilters(automaticFacetFilters || []);
}

function extractRemovedWordsFromQuery(rule) {
    const params = rule.consequence.params || {};
    const {query} = params;

    if (query && typeof query === 'object' && query.constructor === Object) {
        if (query.remove) return query.remove;
        if (!query.edits) return [];

        const removed = query.edits.filter((edit) => {
            return edit.type === 'remove';
        }).map((edit) => {
            return edit.delete;
        });

        if (removed.length > 0) return removed;
    }

    return [];
}

function extractCondition(condition) {
    const hasPatternAndAnchoring = condition.pattern !== undefined && condition.anchoring !== undefined;
    return {
        hasPatternAndAnchoring: hasPatternAndAnchoring,
        pattern: hasPatternAndAnchoring ? condition.pattern : '',
        anchoring: hasPatternAndAnchoring ? condition.anchoring : 'is',
        context: condition.context ? condition.context : '',
        alternatives: condition.alternatives ? condition.alternatives : false,
    }
}

function extractConditions (rule) {
    const condition = rule.condition ? [rule.condition] : [];
    const conditions = rule.conditions || condition;

    return conditions.map((condition) => extractCondition(condition));
}

function extractPromotes (ruleCopy) {
    const promotes = ruleCopy.consequence.promote || [];
    return promotes.map((promote) => {
        return {
            objectIDs: promote.objectIDs || [promote.objectID],
            position: promote.position,
        }
    })
}

function extractUserData(ruleCopy) {
    const {cms, ...userData} = ruleCopy.consequence.userData || {};
    if (Object.keys(userData).length <= 0) return undefined;
    return userData;
}

function extractCms(ruleCopy) {
    const {cms, ...userData} = ruleCopy.consequence.userData || {};
    return cms || [];
}

export default function (rule) {
    const ruleCopy = JSON.parse(JSON.stringify(rule));
    this.objectID = ruleCopy.objectID;

    this.enabled = ruleCopy.enabled === undefined ? true : ruleCopy.enabled;
    this.description = ruleCopy.description;
    this.validity = ruleCopy.validity;

    this.conditions = extractConditions(ruleCopy);

    this.promote = extractPromotes(ruleCopy);
    this.filterPromotes = ruleCopy.consequence.filterPromotes || false;
    this.hide = ruleCopy.consequence.hide || [];
    this.userData = extractUserData(ruleCopy);
    this.cms = extractCms(ruleCopy);

    this.params = extractParamsWithoutSpecial(ruleCopy);
    this.replacedWordsFromQuery = extractReplacedWordsFromQuery(ruleCopy);
    this.replacedQuery = extractReplacedQuery(ruleCopy);
    this.removedWordsFromQuery = extractRemovedWordsFromQuery(ruleCopy);
    this.automaticOptionalFacetFilters = extractAutomaticOptionalFacetFilters(ruleCopy);
    this.automaticFacetFilters = extractAutomaticFacetFilters(ruleCopy);

    this.editableParams = {};
    Object.keys(this.params).forEach((key) => {
        this.editableParams[key] = {value: this.params[key], enabled: true};
    });

    this.hasPromote = this.promote.length > 0;
    this.hasHide = this.hide.length > 0;
    this.hasReplacedQuery = this.replacedQuery !== false;
    this.hasReplacedWordsFromQuery = this.replacedWordsFromQuery.length > 0;
    this.hasRemovedWordsFromQuery = this.removedWordsFromQuery.length > 0;
    this.hasParams = Object.keys(this.params).length > 0;
    this.hasAutomaticFilters = this.automaticFacetFilters.length > 0;
    this.hasAutomaticOptionalFilters = this.automaticOptionalFacetFilters.length > 0;
    this.hasUserData = (this.userData && Object.keys(this.userData) > 0) || false;

    this.getFinalRule = function () {
        const rule = {};
        rule.objectID = this.objectID;
        rule.enabled = this.enabled;

        rule.description = this.description || '';

        if (this.validity) rule.validity = this.validity;

        rule.conditions = this.conditions.map((c) => {
            const condition = {};
            if (c.hasPatternAndAnchoring) {
                condition.pattern = c.pattern;
                condition.anchoring = c.anchoring;
            }

            if (c.context.length > 0) condition.context = c.context;
            if (c.alternatives) condition.alternatives = true;
            return condition;
        });

        rule.consequence = {};

        if (this.conditions.every((c) => c.hasPatternAndAnchoring) && this.hasPromote && this.promote.length > 0) {
            rule.consequence.promote = JSON.parse(JSON.stringify(this.promote));
            if (this.filterPromotes) {
                rule.consequence.filterPromotes = true;
            }
        }
        if (this.hasHide && this.hide.length > 0) rule.consequence.hide = JSON.parse(JSON.stringify(this.hide));

        if (this.hasParams && Object.keys(this.editableParams).length > 0) {
            const params = {};
            Object.keys(this.editableParams).forEach((key) =>  {
                params[key] = JSON.parse(JSON.stringify(this.editableParams[key].value));
            });
            rule.consequence.params = JSON.parse(JSON.stringify(params));
        }

        // Needs to be after params
        if (this.hasReplacedQuery) {
            if (!rule.consequence.params) rule.consequence.params = {};
            rule.consequence.params.query = this.replacedQuery;
        } else if (this.conditions.every((c) => c.hasPatternAndAnchoring)) {
            const replacedWordsFromQuery = this.replacedWordsFromQuery.filter((word) => {
                return word[0].length > 0 && word[1].length > 0;
            });
            if (this.hasReplacedWordsFromQuery && replacedWordsFromQuery.length > 0) {
                if (!rule.consequence.params) rule.consequence.params = {};
                if (!rule.consequence.params.query) rule.consequence.params.query = {edits: []};

                const filteredReplacedWordsFromQuery = replacedWordsFromQuery.map((o) => {
                    return {
                        type: 'replace',
                        delete: o[0],
                        insert: o[1],
                    };
                });
                rule.consequence.params.query.edits.push(...JSON.parse(JSON.stringify(filteredReplacedWordsFromQuery)));
            }

            const removedWordsFromQuery = this.removedWordsFromQuery.filter((word) => { return word.length > 0 });
            if (this.hasRemovedWordsFromQuery && removedWordsFromQuery.length > 0) {
                if (!rule.consequence.params) rule.consequence.params = {};
                if (!rule.consequence.params.query) rule.consequence.params.query = {edits: []};

                const filteredRemovedWordsFromQuery = removedWordsFromQuery.map((o) => {
                    return {
                        type: 'remove',
                        delete: o,
                    };
                });
                rule.consequence.params.query.edits.push(...JSON.parse(JSON.stringify(filteredRemovedWordsFromQuery)));
            }
        }

        if (this.conditions.every((c) => c.hasPatternAndAnchoring)) {
            // Needs to be after params
            const automaticFacetFilters = [];
            this.conditions.forEach((c) => {
                automaticFacetFilters.push(...this.automaticFacetFilters.filter((filter) => {
                    return c.pattern.indexOf(`{facet:${filter.facet}`) !== -1;
                }));
            });
            if (this.hasAutomaticFilters && automaticFacetFilters.length > 0) {
                if (!rule.consequence.params) rule.consequence.params = {};
                rule.consequence.params.automaticFacetFilters = JSON.parse(JSON.stringify(automaticFacetFilters));
            }

            // Needs to be after params
            const automaticOptionalFacetFilters = [];
            this.conditions.forEach((c) => {
                automaticOptionalFacetFilters.push(...this.automaticOptionalFacetFilters.filter((filter) => {
                    return c.pattern.indexOf(`{facet:${filter.facet}`) !== -1;
                }));
            });
            if (this.hasAutomaticOptionalFilters && automaticOptionalFacetFilters.length > 0) {
                if (!rule.consequence.params) rule.consequence.params = {};
                rule.consequence.params.automaticOptionalFacetFilters = JSON.parse(JSON.stringify(automaticOptionalFacetFilters));
            }
        }

        if (this.hasUserData || Object.keys(this.cms).length > 0) {
            const cms = this.cms || undefined;
            rule.consequence.userData = {
                ...(this.userData || {}),
                cms,
            };
        }

        return rule;
    };
}
