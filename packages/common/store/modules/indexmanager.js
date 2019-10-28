import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        appId: null,
    },
    mutations: {
        setAppId: function (state, payload) {
            Vue.set(state, 'appId', payload)
        },
    }
}
