import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        appId: null,
        indexName: null,
        tab: 'click'
    },
    mutations: {
        setAppId: function (state, payload) {
            Vue.set(state, 'appId', payload)
        },
        setIndexName: function (state, payload) {
            Vue.set(state, 'indexName', payload)
        },
        setTab: function (state, payload) {
            Vue.set(state, 'tab', payload)
        },
    }
}
