import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        appId: null,
        indexName: null,
    },
    mutations: {
        setAppId: function (state, payload) {
            Vue.set(state, 'appId', payload)
        },
        setIndexName: function (state, payload) {
            Vue.set(state, 'indexName', payload)
        }
    }
}