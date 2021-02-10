import Vue from 'vue';

export default function (appId, indexName) {
    return {
        namespaced: true,
        state: {
            appId: appId,
            indexName: indexName,
            server: '-dsn',
            displayMode: 'list',
            currentTab: 'hits',
            method: 'search',
        },
        mutations: {
            setPanelConfig(state, payload) {
                Vue.set(state, 'appId', payload.appId);
                Vue.set(state, 'indexName', payload.indexName);
                Vue.set(state, 'server', '-dsn');

                if (state.indexName) {
                    Vue.set(this.state.apps[payload.appId], 'lastIndexName', state.indexName);
                }
            },
            setMethod(state, payload) {
                Vue.set(state, 'method', payload);
            },
            setServer(state, payload) {
                Vue.set(state, 'server', payload);
            },
            setDisplayMode(state, payload) {
                Vue.set(state, 'displayMode', payload);
            },
            setCurrentTab(state, payload) {
                Vue.set(state, 'currentTab', payload);
            }
        },
    }
}
