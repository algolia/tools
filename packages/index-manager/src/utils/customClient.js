import getSignature from "common/src/utils/signature";
import * as algoliasearch from "algoliasearch";

const clientCache = {};
let lock = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function (appId, apiKey) {
    while (lock) {
        await sleep(10);
    }

    if (clientCache[`${appId}-${apiKey}`]) return clientCache[`${appId}-${apiKey}`];

    lock = true;
    const client = algoliasearch(appId, apiKey);
    const signature = await getSignature(appId);
    client.setExtraHeader('X-Algolia-Signature', signature);
    clientCache[`${appId}-${apiKey}`] = client;
    lock = false;
    return client;
}