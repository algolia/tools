import { compositionClient } from '@algolia/composition';

const clientCache = {};

function getClient(appId, apiKey) {
    const cacheKey = `${appId}::${apiKey}`;
    if (!clientCache[cacheKey]) {
        clientCache[cacheKey] = compositionClient(appId, apiKey);
    }
    return clientCache[cacheKey];
}

export async function runComposition({ appId, apiKey, compositionID, requestBody }) {
    const client = getClient(appId, apiKey);
    return client.search({ compositionID, requestBody });
}

export async function listCompositions({ appId, apiKey }) {
    const client = getClient(appId, apiKey);
    return client.listCompositions();
}

export function parsePayload(text) {
    if (text == null || text.trim() === '') {
        return { ok: false, error: 'Payload is empty' };
    }
    try {
        const value = JSON.parse(text);
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
            return { ok: false, error: 'Payload must be a JSON object' };
        }
        return { ok: true, value };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

export function buildCurl({ appId, apiKey, compositionID, requestBody, embedKey }) {
    const idValue = appId || '<YOUR_APP_ID>';
    const compIdValue = compositionID || '<YOUR_COMPOSITION_ID>';
    const keyValue = embedKey && apiKey ? apiKey : '<YOUR_API_KEY>';
    const bodyValue = JSON.stringify(requestBody ?? {});
    return [
        'curl -X POST \\',
        `  "https://${idValue}.algolia.net/1/compositions/${compIdValue}/run" \\`,
        `  -H "x-algolia-application-id: ${idValue}" \\`,
        `  -H "x-algolia-api-key: ${keyValue}" \\`,
        '  -H "Content-Type: application/json" \\',
        `  -d '${bodyValue.replace(/'/g, "'\\''")}'`,
    ].join('\n');
}

const IMAGE_URL_RE = /^(https?:|\/\/).+\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?[^#]*)?(#.*)?$/i;

export function findImageUrl(hit) {
    if (!hit || typeof hit !== 'object') return null;
    for (const key of Object.keys(hit)) {
        if (key.startsWith('_')) continue;
        const value = hit[key];
        if (typeof value === 'string' && IMAGE_URL_RE.test(value)) return value;
        if (Array.isArray(value)) {
            for (const item of value) {
                if (typeof item === 'string' && IMAGE_URL_RE.test(item)) return item;
            }
        }
    }
    return null;
}

const PREFERRED_PREVIEW_KEYS = ['title', 'name', 'label', 'displayName', 'description'];

export function findPreviewText(hit) {
    if (!hit || typeof hit !== 'object') return null;
    for (const key of PREFERRED_PREVIEW_KEYS) {
        const value = hit[key];
        if (typeof value === 'string' && value.length > 0) return value;
    }
    for (const key of Object.keys(hit)) {
        if (key.startsWith('_')) continue;
        if (key === 'objectID') continue;
        const value = hit[key];
        if (typeof value === 'string' && value.length > 0 && value.length <= 200) return value;
    }
    return null;
}

export function getInjectedItemKey(hit) {
    if (!hit || !hit._extra) return null;
    const value = hit._extra._injectedItemKey;
    return typeof value === 'string' && value.length > 0 ? value : null;
}

export function extractErrorInfo(err) {
    if (!err) return { title: 'Request failed', message: 'Unknown error' };
    const status = err.status || (err.response && err.response.status);
    const title = status ? `Request failed — ${status}` : 'Request failed';
    const message = err.message || String(err);
    return { title, message };
}

export async function executeRun(store) {
    const state = store.state.compositionrunner;
    const apps = store.state.apps;
    const appId = state.appId;
    const apiKey = appId && apps[appId] ? (apps[appId].key || '') : '';
    const compositionID = state.compositionId;

    // The form's canRun computed gates these. If we ever land here without all
    // three, that's a caller bug worth surfacing in the console rather than a
    // user-facing error.
    if (!appId || !apiKey || !compositionID) {
        // eslint-disable-next-line no-console
        console.warn('executeRun called with missing prerequisites', { appId, hasApiKey: Boolean(apiKey), compositionID });
        return { ok: false };
    }

    const parsed = parsePayload(state.payload);
    if (!parsed.ok) {
        store.commit('compositionrunner/setError', {
            title: 'Invalid payload',
            message: parsed.error,
        });
        store.commit('compositionrunner/setStatus', 'error');
        return { ok: false };
    }

    store.commit('compositionrunner/setStatus', 'loading');
    store.commit('compositionrunner/setError', null);
    store.commit('compositionrunner/setResponse', null);
    store.commit('compositionrunner/setElapsedMs', null);

    const start = Date.now();
    try {
        const response = await runComposition({
            appId,
            apiKey,
            compositionID,
            requestBody: parsed.value,
        });
        store.commit('compositionrunner/setResponse', response);
        store.commit('compositionrunner/setElapsedMs', Date.now() - start);
        store.commit('compositionrunner/setStatus', 'success');
        return { ok: true };
    } catch (err) {
        store.commit('compositionrunner/setError', extractErrorInfo(err));
        store.commit('compositionrunner/setElapsedMs', Date.now() - start);
        store.commit('compositionrunner/setStatus', 'error');
        return { ok: false };
    }
}
