import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        appId: null,
        indexName: null,
        attributeName: '',
    },
    mutations: {
        setAppId: function (state, payload) {
            Vue.set(state, 'appId', payload);
        },
        setIndexName: function (state, payload) {
            Vue.set(state, 'indexName', payload);
        },
        setAttributeName: function (state, payload) {
            Vue.set(state, 'attributeName', payload);
        }
    }
}
