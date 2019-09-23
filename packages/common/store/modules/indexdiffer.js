import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        leftAppId: null,
        leftIndexName: null,
        rightAppId: null,
        rightIndexName: null,
        currentTab: 'settings',
    },
    mutations: {
        setLeftAppId: function (state, payload) {
            Vue.set(state, 'leftAppId', payload)
        },
        setLeftIndexName: function (state, payload) {
            Vue.set(state, 'leftIndexName', payload)
        },
        setRightAppId: function (state, payload) {
            Vue.set(state, 'rightAppId', payload)
        },
        setRightIndexName: function (state, payload) {
            Vue.set(state, 'rightIndexName', payload)
        },
        setCurrentTab: function (state, payload) {
            Vue.set(state, 'currentTab', payload);
        }
    }
}