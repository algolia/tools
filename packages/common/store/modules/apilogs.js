import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        appId: null,
        indexName: null,
        server: null,
        logsType: null,
    },
    mutations: {
        setAppId: function (state, payload) {
            Vue.set(state, 'appId', payload);
        },
        setIndexName: function (state, payload) {
            Vue.set(state, 'indexName', payload);
        },
        setServer: function (state, payload) {
            Vue.set(state, 'server', payload);
        },
        setLogsType: function (state, payload) {
            Vue.set(state, 'logsType', payload);
        }
    }
}
