import algoliasearch from 'algoliasearch';
import sleep from "../../utils/time";

const cache = {};
const lock = {};

let applicationsIndex = undefined;

export async function getApplicationsIndex() {
    const backendEndpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT;

    let res = null;
    try {
        res = await fetch(`${backendEndpoint}/applications-credentials`, {
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (e) {
        console.error(e);
        return null;
    }

    const json = await res.json();

    if (applicationsIndex === undefined) {
        applicationsIndex = json;
    }

    if (applicationsIndex.apiKey) {
        const client = algoliasearch(applicationsIndex.appId, applicationsIndex.apiKey);
        return client.initIndex(applicationsIndex.indexName);
    }
    return null;
}

export default async function (appId, getListWithoutDsn) {
    while (lock[appId]) {
        await sleep(10);
    }

    if (cache[appId]) return cache[appId];

    lock[appId] = true;

    cache[appId] = ['-dsn'];

    const index = await getApplicationsIndex();
    if (index) {
        const res = await index.search('', {filters: `application_id:${appId}`});

        if (res.hits.length > 0 && res.hits[0].clusters_and_replicas_names && res.hits[0].clusters_and_replicas_names.length >= 0) {
            if (getListWithoutDsn) {
                cache[appId] = res.hits[0].clusters_and_replicas_names;
            } else {
                const replicas = res.hits[0].clusters_and_replicas_names.slice(1);
                cache[appId] =  ['-dsn', ...replicas];
            }
        }
    }

    lock[appId] = false;

    return cache[appId];
}
