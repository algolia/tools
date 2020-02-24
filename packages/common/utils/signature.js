import sleep from "./time";

const cache = {};

const lock = {};

export default async function (appId) {
    while (lock[appId]) {
        await sleep(10);
    }

    if (cache[appId]) return cache[appId];

    lock[appId] = true;
    const backendEndpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';

    const res = await fetch(`${backendEndpoint}/signature/${appId}`, {
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json();
    const signature = json.signature ? json.signature : '';

    cache[appId] = signature;
    lock[appId] = false;
    return signature;
}
