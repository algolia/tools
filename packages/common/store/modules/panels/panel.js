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
                state.method = payload;
            },
            setServer(state, payload) {
                state.server = payload;
            },
            setDisplayMode(state, payload) {
                state.displayMode = payload;
            },
            setCurrentTab(state, payload) {
                state.currentTab = payload;
            }
        },
    }
}
