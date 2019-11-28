import algoliasearch from 'algoliasearch';
import {createNullCache} from '@algolia/cache-common';
import getSignature from "./signature";

const isLocalAppId = function (appId) {
    return appId === 'MySuperApp' || appId.endsWith('.local') || appId.endsWith('.test');
};

const getNewParams = function (params) {
    const newQuery = {...params};
    if (params['optionalWords=query'] && params.query) {
        newQuery.optionalWords = params.query;
    }
    delete(newQuery['optionalWords=query']);

    return newQuery;
};

const methods = {};
methods.buildFacetFilters = function (facetFilters, needle) {
    return facetFilters.map((facetFilter) => {
        const refinements = Array.isArray(facetFilter) ? facetFilter : [facetFilter];
        return refinements.filter((refinement) => {
            return !refinement.startsWith(needle);
        })
    }).filter((facetFilter) => facetFilter.length > 0);
};

methods.getDisjunctiveRequests = function (disjunctiveFacets, refinedFacets, paramsWithoutDisjunctiveFacets) {
    const requests = [];

    requests.push({
        indexName: this.indexName,
        params: this.as._getSearchParams({
            ...paramsWithoutDisjunctiveFacets,
            facets: disjunctiveFacets,
        }, ''),
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
            params: this.as._getSearchParams(Object.assign({}, paramsWithoutDisjunctiveFacets, forcedParams), ''),
        });
    });

    return requests;
};

methods.disjunctiveSearch = function (params, callback) {
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

    return new Promise((resolve, reject) => {
        this.as._jsonRequest({
            method: 'POST',
            url: '/1/indexes/*/queries',
            body: {
                requests: requests,
                strategy: 'none'
            },
            hostType: 'read',
            callback: (err, res) => {
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

                if (callback) {
                    return callback(err, newRes);
                } else {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(newRes);
                    }
                }
            },
        });
    });
};

methods.customSearch = function (query, args, callback) {
    let params = {};
    if (query && typeof query === 'object' && query.constructor === Object) params = query;
    if (args && typeof args === 'object' && args.constructor === Object) params = {...args, query};

    params = getNewParams(params);

    if (params.disjunctiveFacets && params.disjunctiveFacets.length > 0) return this.disjunctiveSearch(params, callback);
    delete (params.disjunctiveFacets);

    return this.search(params, callback);
};

methods.customBrowse = function (query, args, callback) {
    let params = {};
    if (query && typeof query === 'object' && query.constructor === Object) params = query;
    if (args && typeof args === 'object' && args.constructor === Object) params = {...args, query};

    params = getNewParams(params);
    delete (params.disjunctiveFacets);

    return this.browse(params, callback);
};

methods.customSearchForFacetValues = function(args, callback) {
    const params = getNewParams(args);
    return this.searchForFacetValues(args, callback);
};

const clientCache = {};
const searchClientCache = {};
const indexCache = {};

function searchClient(appId, apiKey, server) {
    if (isLocalAppId(appId)) {
      const client = algoliasearch(appId, apiKey || ' ', {
        methods: methods,
      });

      client.transporter.requestsCache = createNullCache();
      client.transporter.responsesCache = createNullCache();
      client.transporter.timeouts.read = 10;
      client.transporter.setHosts([{url: 'localhost-1.algolia.io:8080', accept: 3}]);
      return client;
    }

    const hosts = [];

    if (server === undefined || server === 'dsn' || server === '-dsn') { // BC
        const client = algoliasearch(appId, apiKey || ' ');

        client.transporter.requestsCache = createNullCache();
        client.transporter.responsesCache = createNullCache();
        client.transporter.timeouts.read = 10;

        client.transporter.setHosts([
            {url: appId + '-1.algolianet.com', accept: 3},
            {url: appId + '-2.algolianet.com', accept: 3},
            {url: appId + '-3.algolianet.com', accept: 3},
        ]);

        return client;
    } else if (server === '-1') hosts.push({url: `${appId}-1.algolianet.com`, accept: 3});
    else if (server === '-2') hosts.push({url: `${appId}-2.algolianet.com`, accept: 3});
    else if (server === '-3') hosts.push({url: `${appId}-3.algolianet.com`, accept: 3});
    else hosts.push({url: `${server}-1.algolia.net`, accept: 3});

    const client = algoliasearch(appId, apiKey || ' ', {
        methods: methods,
    });

    client.transporter.requestsCache = createNullCache();
    client.transporter.responsesCache = createNullCache();
    client.transporter.timeouts.read = 10;
    client.transporter.setHosts(hosts);

    return client;
}

export async function getClient(appId, apiKey) {
    const cacheKey = `${appId}-${apiKey}`;
    if (clientCache[cacheKey]) return clientCache[cacheKey];

    if (isLocalAppId(appId)) {
      const client = algoliasearch(appId, apiKey || ' ');

      client.transporter.requestsCache = createNullCache();
      client.transporter.responsesCache = createNullCache();
      client.transporter.timeouts.read = 10;
      client.transporter.setHosts([{url: 'localhost-1.algolia.io:8080', accept: 3}]);

      return client;
    }

    const client = algoliasearch(appId, apiKey || ' ');

    client.transporter.requestsCache = createNullCache();
    client.transporter.responsesCache = createNullCache();
    client.transporter.timeouts.read = 10;
    client.transporter.setHosts([
        {url: appId + '-1.algolianet.com', accept: 3},
        {url: appId + '-2.algolianet.com', accept: 3},
        {url: appId + '-3.algolianet.com', accept: 3},
    ]);

    if (apiKey) {
        const signature = await getSignature(appId);
        client.transporter.addHeaders({'X-Algolia-Signature': signature});
    }

    clientCache[cacheKey] = client;
    return client;
}

export async function getSearchClient(appId, apiKey, server) {
    const cacheKey = `${appId}-${apiKey}-${server}`;
    if (searchClientCache[cacheKey]) return searchClientCache[cacheKey];
    const client = searchClient(appId, apiKey, server);
    if (apiKey && !isLocalAppId(appId)) {
        const signature = await getSignature(appId);
        client.transporter.addHeaders({'X-Algolia-Signature': signature});
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
