import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        filtering: 'all',
    },
    mutations: {
        setFiltering: function (state, payload) {
            Vue.set(state, 'filtering', payload)
        },
    }
}
