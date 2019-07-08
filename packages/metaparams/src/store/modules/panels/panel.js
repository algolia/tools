import Vue from 'vue';

export default function (appId, indexName) {
    return {
        namespaced: true,
        state: {
            appId: appId,
            indexName: indexName,
            server: 'dsn',
            algoliaResponse: null,
            displayMode: 'list',
            currentTab: 'hits'
        },
        mutations: {
            setAlgoliaResponse(state, payload) {
                Vue.set(state, 'algoliaResponse', payload);
            },
            setPanelConfig(state, payload) {
                state.appId = payload.appId;
                state.indexName = payload.indexName;
                state.server = 'dsn';

                if (state.indexName) {
                    Vue.set(this.state.apps[payload.appId], 'lastIndexName', state.indexName);
                }
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