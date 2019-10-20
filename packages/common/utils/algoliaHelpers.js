import algoliasearch from '@nunomaduro/lightsearch';
import getSignature from "./signature";

const client = algoliasearch('A', 'B');
const index = client.initIndex('AB');
const indexPrototype = Object.getPrototypeOf(index);

function encode(format, ...args) {
    let i = 0;
    return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
}

function encodeQueryParameters(parameters) {
    const parametersKeys = Object.keys(parameters);
    return `${parametersKeys.map(key => encode('%s=%s', key, parameters[key])).join('&')}`;
}

const getNewParams = function (params) {
    const newQuery = {...params};
    if (params['optionalWords=query'] && params.query) {
        newQuery.optionalWords = params.query;
    }
    delete(newQuery['optionalWords=query']);
    delete(newQuery['query']);

    return newQuery;
};

indexPrototype.buildFacetFilters = function (facetFilters, needle) {
    return facetFilters.map((facetFilter) => {
        const refinements = Array.isArray(facetFilter) ? facetFilter : [facetFilter];
        return refinements.filter((refinement) => {
            return !refinement.startsWith(needle);
        })
    }).filter((facetFilter) => facetFilter.length > 0);
};

indexPrototype.getDisjunctiveRequests = function (disjunctiveFacets, refinedFacets, paramsWithoutDisjunctiveFacets) {
    const requests = [];

    requests.push({
        indexName: this.indexName,
        params: encodeQueryParameters({
            ...paramsWithoutDisjunctiveFacets,
            facets: disjunctiveFacets,
        }),
    });

    refinedFacets.forEach((facetName) => {
        const facetFilters = this.buildFacetFilters(paramsWithoutDisjunctiveFacets.facetFilters || [], `${facetName}:`);

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
            indexName: this.indexName,
            params: encodeQueryParameters(Object.assign({}, paramsWithoutDisjunctiveFacets, forcedParams), ''),
        });
    });

    return requests;
};

indexPrototype.disjunctiveSearch = function (params) {
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

    const requests = this.getDisjunctiveRequests(disjunctiveFacets, refinedFacets, paramsWithoutDisjunctiveFacets);
    const $this = this;

    return new Promise((resolve) => {
        $this.transporter.write({
            method: 'POST',
            path: '1/indexes/*/queries',
            data: {
                requests: requests,
                strategy: 'none'
            },
        }).then((res) => {
            const newRes = res.results[0];
            newRes.disjunctiveFacets = JSON.parse(JSON.stringify(newRes.facets));

            refinedFacets.forEach((facetName, i) => {
                newRes.disjunctiveFacets[facetName] = res.results[i + 1].facets[facetName];
                facetRefinements[facetName].forEach((value) => {
                    if (newRes.disjunctiveFacets[facetName][value] === undefined) {
                        newRes.disjunctiveFacets[facetName][value] = null;
                    }
                });
            });

            resolve(newRes);
        });
    });
};

indexPrototype.customSearch = function (query, requestOptions) {
    const params = getNewParams({
        query,
        ...requestOptions,
    });

    if (params.disjunctiveFacets && params.disjunctiveFacets.length > 0) return this.disjunctiveSearch(params);
    delete (params.disjunctiveFacets);

    return this.search(query, params);
};

indexPrototype.customBrowse = function (requestOptions) {
    let params = getNewParams(requestOptions);
    delete (params.disjunctiveFacets);

    return this.browseObjects(requestOptions);
};

indexPrototype.customSearchForFacetValues = function(facetName, facetValue, args) {
    const params = getNewParams(args || {});
    return this.searchForFacetValues(facetName, facetValue, {...params, query: args && args.query ? args.query : ''});
};

const clientCache = {};
const searchClientCache = {};
const indexCache = {};

function searchClient(appId, apiKey, server) {
    if (appId === 'MySuperApp') {
      return algoliasearch(appId, apiKey || ' ', {
        _useCache: false,
        hosts: ['localhost-1.algolia.io:8080'],
      });
    }

    if (server === undefined || server === 'dsn') {
        return algoliasearch(appId, apiKey || ' ', {
            _useCache: false,
            hosts: [appId + '-1.algolianet.com', appId + '-2.algolianet.com', appId + '-3.algolianet.com']
        });
    }

    const hosts = [];
    if (server === '1') hosts.push(appId + '-1.algolianet.com');
    if (server === '2') hosts.push(appId + '-2.algolianet.com');
    if (server === '3') hosts.push(appId + '-3.algolianet.com');

    return algoliasearch(appId, apiKey || ' ', {
        hosts: hosts,
        _useCache: false,
    });
}

export async function getClient(appId, apiKey) {
    const cacheKey = `${appId}-${apiKey}`;
    if (clientCache[cacheKey]) return clientCache[cacheKey];

    if (appId === 'MySuperApp') {
      return algoliasearch(appId, apiKey || ' ', {
        _useCache: false,
        hosts: ['localhost-1.algolia.io:8080'],
      });
    }

    const client = algoliasearch(appId, apiKey || ' ', {
        _useCache: false,
        hosts: [appId + '-1.algolianet.com', appId + '-2.algolianet.com', appId + '-3.algolianet.com']
    });
    if (apiKey) {
        const signature = await getSignature(appId);
        client.transporter.headers = {
            ...client.transporter.headers,
            'X-Algolia-Signature': signature,
        };
    }
    clientCache[cacheKey] = client;
    return client;
}

export async function getSearchClient(appId, apiKey, server) {
    const cacheKey = `${appId}-${apiKey}-${server}`;
    if (searchClientCache[cacheKey]) return searchClientCache[cacheKey];
    const client = searchClient(appId, apiKey, server);
    if (apiKey && appId !== 'MySuperApp') {
        const signature = await getSignature(appId);
        client.transporter.headers = {
            ...client.transporter.headers,
            'X-Algolia-Signature': signature,
        };
    }
    clientCache[cacheKey] = client;
    return client;
}

// todo no need to cache this, only the client matters
export async function getSearchIndex(appId, apiKey, indexName, server) {
    const cacheKey = `${appId}-${apiKey}-${indexName}-${server}`;
    if (indexCache[cacheKey]) return indexCache[cacheKey];
    const client = await getSearchClient(appId, apiKey, server);
    const index = client.initIndex(indexName);

    index.__proto__.buildFacetFilters = indexPrototype.buildFacetFilters;
    index.__proto__.getDisjunctiveRequests = indexPrototype.getDisjunctiveRequests;
    index.__proto__.disjunctiveSearch = indexPrototype.disjunctiveSearch;
    index.__proto__.customSearch = indexPrototype.customSearch;
    index.__proto__.customBrowse = indexPrototype.customBrowse;
    index.__proto__.customSearchForFacetValues = indexPrototype.customSearchForFacetValues;

    indexCache[cacheKey] = index;
    return index;
}

export function algoliaParams(params) {
    const algParams = {};

    Object.keys(params).forEach(function (key) {
        if (params[key].enabled) {
            algParams[key] = params[key].value;
        }
    });

    return JSON.parse(JSON.stringify(algParams));
}
