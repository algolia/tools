import Vue from 'vue';

const DEFAULT_PAYLOAD = '{\n  "params": {\n    "getRankingInfo": true\n  }\n}';

export default {
    namespaced: true,
    state: {
        appId: null,
        compositionId: '',
        payload: DEFAULT_PAYLOAD,
        payloadVersion: 0,
        status: 'idle',
        error: null,
        response: null,
        elapsedMs: null,
        openHit: null,
        showCurl: false,
        embedKey: false,
    },
    mutations: {
        setAppId: function (state, payload) {
            Vue.set(state, 'appId', payload);
        },
        setCompositionId: function (state, payload) {
            Vue.set(state, 'compositionId', payload);
        },
        setPayload: function (state, payload) {
            Vue.set(state, 'payload', payload);
        },
        overwritePayload: function (state, payload) {
            Vue.set(state, 'payload', payload);
            Vue.set(state, 'payloadVersion', state.payloadVersion + 1);
        },
        setStatus: function (state, payload) {
            Vue.set(state, 'status', payload);
        },
        setError: function (state, payload) {
            Vue.set(state, 'error', payload);
        },
        setResponse: function (state, payload) {
            Vue.set(state, 'response', payload);
        },
        setElapsedMs: function (state, payload) {
            Vue.set(state, 'elapsedMs', payload);
        },
        setOpenHit: function (state, payload) {
            Vue.set(state, 'openHit', payload);
        },
        setShowCurl: function (state, payload) {
            Vue.set(state, 'showCurl', payload);
        },
        setEmbedKey: function (state, payload) {
            Vue.set(state, 'embedKey', payload);
        },
    },
};

export { DEFAULT_PAYLOAD };
