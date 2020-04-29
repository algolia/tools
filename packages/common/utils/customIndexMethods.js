import {encode} from '@algolia/client-common';
import { serializeQueryParameters } from '@algolia/transporter';

const getNewParams = function (params) {
    const newQuery = {...params};
    if (params['optionalWords=query'] && params.query) {
        newQuery.optionalWords = params.query;
    }
    delete(newQuery['optionalWords=query']);
    delete(newQuery['extraChartsAttributes']);

    return newQuery;
};

const buildFacetFilters = function (facetFilters, needle) {
    return facetFilters.map((facetFilter) => {
        const refinements = Array.isArray(facetFilter) ? facetFilter : [facetFilter];
        return refinements.filter((refinement) => {
            return !refinement.startsWith(needle);
        })
    }).filter((facetFilter) => facetFilter.length > 0);
};

const safeJSONStringify = function (obj) {
    /* eslint no-extend-native:0 */

    if (Array.prototype.toJSON === undefined) {
        return JSON.stringify(obj);
    }

    var toJSON = Array.prototype.toJSON;
    delete Array.prototype.toJSON;
    var out = JSON.stringify(obj);
    Array.prototype.toJSON = toJSON;

    return out;
}

const _getSearchParams = function(args, params) {
    if (args === undefined || args === null) {
        return params;
    }
    for (var key in args) {
        if (key !== null && args[key] !== undefined && args.hasOwnProperty(key)) {
            params += params === '' ? '' : '&';
            params += key + '=' + encodeURIComponent(Object.prototype.toString.call(args[key]) === '[object Array]' ? safeJSONStringify(args[key]) : args[key]);
        }
    }
    return params;
};


const getDisjunctiveRequests = function (indexName, disjunctiveFacets, refinedFacets, paramsWithoutDisjunctiveFacets) {
    const requests = [];

    requests.push({
        indexName: indexName,
        params: _getSearchParams({
            ...paramsWithoutDisjunctiveFacets,
            facets: disjunctiveFacets,
        }, ''),
    });

    refinedFacets.forEach((facetName) => {
        const facetFilters = buildFacetFilters(paramsWithoutDisjunctiveFacets.facetFilters || [], `${facetName}:`);

        const forcedParams = {
            facetFilters: facetFilters,
            facets: [facetName],
            analytics: false,
            attributesToRetrieve: [],
            attributesToHighlight: [],
            attributesToSnippet: [],
            hitsPerPage: 1,
            page: 0,
            explain: undefined,
        };

        requests.push({
            indexName: indexName,
            params: _getSearchParams(Object.assign({}, paramsWithoutDisjunctiveFacets, forcedParams), ''),
        });
    });

    return requests;
};

const disjunctiveSearch = async function (params) {
    const {disjunctiveFacets, ...paramsWithoutDisjunctiveFacets} = params;

    const facetFilters = paramsWithoutDisjunctiveFacets.facetFilters || [];
    const facetRefinements = {};
    disjunctiveFacets.forEach((facetName) => {
        return facetFilters.forEach((facetFilter) => {
            facetRefinements[facetName] = [];
            const refinements = Array.isArray(facetFilter) ? facetFilter : [facetFilter];
            refinements.forEach((refinement) => {
                if (refinement.startsWith(`${facetName}:`)) {
                    facetRefinements[facetName].push(refinement.replace(`${facetName}:`, ''));
                }
            });
        });
    });
    const refinedFacets = Object.keys(facetRefinements).filter((facetName) => {
        return facetRefinements[facetName].length > 0;
    });

    const requests = getDisjunctiveRequests(this.indexName, disjunctiveFacets, refinedFacets, paramsWithoutDisjunctiveFacets);
    const requestOptions = {};
    if (this.userId() !== undefined) requestOptions.headers = {'X-Algolia-User-ID': this.userId()};

    const res = await this.transporter.read({
        method: 'POST',
        path: '1/indexes/*/queries',
        data: {
            requests: requests,
            strategy: 'none'
        },
    }, requestOptions);

    const newRes = res.results[0];

    newRes.disjunctiveFacets = JSON.parse(JSON.stringify(newRes.facets || {}));

    refinedFacets.forEach((facetName, i) => {
        newRes.disjunctiveFacets[facetName] = res.results[i + 1].facets[facetName];
        facetRefinements[facetName].forEach((value) => {
            if (newRes.disjunctiveFacets[facetName] && newRes.disjunctiveFacets[facetName][value] === undefined) {
                newRes.disjunctiveFacets[facetName][value] = null;
            }
        });
    });

    return newRes;
};

const customSearch = function (params) {
    const newParams = getNewParams(params);

    if (newParams.disjunctiveFacets && newParams.disjunctiveFacets.length > 0) return this.disjunctiveSearch(newParams);
    delete (newParams.disjunctiveFacets);

    if (this.userId() !== undefined) newParams.headers = {'X-Algolia-User-ID': this.userId()};
    return this.search(newParams.query || '', newParams);
};

const customBrowse = function (params) {
    const newParams = getNewParams(params);
    const cursor = newParams.cursor || null;
    delete (newParams.disjunctiveFacets);
    delete (newParams.cursor);

    const data = { params: serializeQueryParameters(newParams) };
    if (cursor) data.cursor = cursor;

    const requestOptions = {};
    if (this.userId() !== undefined) requestOptions.headers = {'X-Algolia-User-ID': this.userId()};

    return this.transporter.read({
        method: 'POST',
        path: encode('/1/indexes/%s/browse', this.indexName),
        data: data,
    }, requestOptions);
};

const customSearchForFacetValues = function (args) {
    const {
        facetName,
        facetQuery,
        ...newParams
    } = getNewParams(args);
    if (this.userId() !== undefined) newParams.headers = {'X-Algolia-User-ID': this.userId()};
    return this.searchForFacetValues(facetName, facetQuery, newParams);
};

export default {
    customSearch,
    customBrowse,
    disjunctiveSearch,
    customSearchForFacetValues,
    buildFacetFilters,
}
