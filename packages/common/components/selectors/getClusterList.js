import algoliasearch from 'algoliasearch';

const cache = {};
const lock = {};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let key = null;

async function getKey() {
    const backendEndpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://algolia-apps-backend.herokuapp.com';

    const res = await fetch(`${backendEndpoint}/applications-search-key`, {
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json();
    return json.key;
}

export default async function (appId, getListWithoutDsn) {
    while (lock[appId]) {
        await sleep(10);
    }

    if (cache[appId]) return cache[appId];

    lock[appId] = true;

    if (key === null) {
        key = await getKey();
    }

    const client = algoliasearch('X20GSLY1CL', key);
    const index = client.initIndex('applications_production');

    const res = await index.search('', {filters: `application_id:${appId}`});

    if (res.hits.length > 0 && res.hits[0].clusters_and_replicas_names && res.hits[0].clusters_and_replicas_names.length > 1) {
        if (getListWithoutDsn) {
            cache[appId] = res.hits[0].clusters_and_replicas_names;
        } else {
            const replicas = res.hits[0].clusters_and_replicas_names.slice(1);
            cache[appId] =  ['-dsn', ...replicas];
        }
    } else {
        cache[appId] =  ['-dsn'];
    }

    lock[appId] = false;

    return cache[appId];
}
