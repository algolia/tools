import algoliasearch from 'algoliasearch';
import getSignature from "./signature";

const clientCache = {};
const searchClientCache = {};
const indexCache = {};

function searchClient(appId, apiKey, server) {
    if (server === undefined || server === 'dsn') {
        return algoliasearch(appId, apiKey || ' ', {
            _useCache: false,
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
    if (clientCache[`${appId}-${apiKey}`]) return clientCache[`${appId}-${apiKey}`];
    const client = algoliasearch(appId, apiKey || ' ');
    const signature = await getSignature(appId);
    client.setExtraHeader('X-Algolia-Signature', signature);
    clientCache[`${appId}-${apiKey}`] = client;
    return client;
}

export async function getSearchClient(appId, apiKey, server) {
    if (searchClientCache[`${appId}-${apiKey}-${server}`]) return searchClientCache[`${appId}-${apiKey}-${server}`];
    const client = searchClient(appId, apiKey, server);
    const signature = await getSignature(appId);
    client.setExtraHeader('X-Algolia-Signature', signature);
    clientCache[`${appId}-${apiKey}`] = client;
    return client;
}

export async function getSearchIndex(appId, apiKey, indexName, server) {
    if (indexCache[`${appId}-${indexName}-${server}`]) return indexCache[`${appId}-${indexName}-${server}`];
    const client = await getSearchClient(appId, apiKey, server);
    const index = client.initIndex(indexName);
    indexCache[`${appId}-${indexName}`] = index;
    return index;
}