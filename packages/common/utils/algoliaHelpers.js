import algoliasearch from 'algoliasearch';
import getSignature from "./signature";

const clientCache = {};
const searchClientCache = {};
const indexCache = {};

function searchClient(appId, apiKey, server) {
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
    const client = algoliasearch(appId, apiKey || ' ', {
        _useCache: false,
        hosts: [appId + '-1.algolianet.com', appId + '-2.algolianet.com', appId + '-3.algolianet.com']
    });
    if (apiKey) {
        const signature = await getSignature(appId);
        client.setExtraHeader('X-Algolia-Signature', signature);
    }
    clientCache[cacheKey] = client;
    return client;
}

export async function getSearchClient(appId, apiKey, server) {
    const cacheKey = `${appId}-${apiKey}-${server}`;
    if (searchClientCache[cacheKey]) return searchClientCache[cacheKey];
    const client = searchClient(appId, apiKey, server);
    if (apiKey) {
        const signature = await getSignature(appId);
        client.setExtraHeader('X-Algolia-Signature', signature);
    }
    clientCache[cacheKey] = client;
    return client;
}

export async function getSearchIndex(appId, apiKey, indexName, server) {
    const cacheKey = `${appId}-${apiKey}-${indexName}-${server}`;
    if (indexCache[cacheKey]) return indexCache[cacheKey];
    const client = await getSearchClient(appId, apiKey, server);
    const index = client.initIndex(indexName);
    indexCache[cacheKey] = index;
    return index;
}