const cache = {};

const lock = {};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function (appId) {
    while (lock[appId]) {
        await sleep(10);
    }

    if (cache[appId]) return cache[appId];

    lock[appId] = true;
    const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/signature/${appId}`, {
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