const cache = {};

export default async function (appId) {
    if (cache[appId]) return cache[appId];

    const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/signature/${appId}`, {
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json();
    const signature = json.signature ? json.signature : '';

    cache[appId] = signature;

    return signature;
}