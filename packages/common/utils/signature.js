import sleep from "./time";

const cache = {};

const lock = {};

async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
}

export default async function (appId) {
    while (lock[appId]) {
        await sleep(10);
    }

    if (cache[appId]) return cache[appId];

    lock[appId] = true;

    let signature = null;
    if (window.signature) {
        signature = await digestMessage(`${appId}${window.signature}`);
    }

    cache[appId] = signature;
    lock[appId] = false;
    return signature;
}
