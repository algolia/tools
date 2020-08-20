import Vue from 'vue';
import panel from "./panel";

export default {
    namespaced: true,
    modules: {
        leftPanel: panel(null, null),
        rightPanel: panel(null, null)
    },
    state: {
        splitMode: false,
        query: '',
        twoInputs: false,
        displayRankingInfo: false,
        showSearchableAttributes: true,
        showCustomRanking: true,
        showAttributesForFaceting: true,
        showOnlyMatchingAttributes: false,
        showParamsAndSettings: true,
        showIndexSelector: true,
        showResultTabs: true,
        showQueryInfo: true,
        comparePanels: false,
        manageAppsPanel: false,
        expandLeftPanel: false,
        analyseMaxNbPoints: 100,
        shareStatePanel: false,
        compareKey: 'objectID',
        trackedObjects: [],
    },
    mutations: {
        setTrackedObjects: function (state, payload) {
            Vue.set(state, 'trackedObjects', payload);
        },
        setTwoInputs: function (state, payload) {
            Vue.set(state, 'twoInputs', payload);
        },
        replacePanels: function (state, payload) {
            Object.keys(payload).forEach((key) => {
                if (state[key] !== undefined) {
                    Vue.set(state, key, payload[key]);
                }
            });
        },
        setShareStatePanel(state, payload) {
            Vue.set(state, 'shareStatePanel', payload);
        },
        setExpandLeftPanel(state, payload) {
            Vue.set(state, 'expandLeftPanel', payload);
        },
        setManageAppsPanel(state, payload) {
            Vue.set(state, 'manageAppsPanel', payload);
        },
        setAnalyseMaxNbPoints(state, payload) {
            Vue.set(state, 'analyseMaxNbPoints', payload);
        },
        setCompareKey(state, payload) {
            Vue.set(state, 'compareKey', payload);
        },
        setComparePanels(state, payload) {
            Vue.set(state, 'comparePanels', payload);
        },
        setDisplayRankingInfo(state, payload) {
            Vue.set(state, 'displayRankingInfo', payload);
        },
        setShowSearchableAttributes(state, payload) {
            Vue.set(state, 'showSearchableAttributes', payload);
        },
        setShowCustomRanking(state, payload) {
            Vue.set(state, 'showCustomRanking', payload);
        },
        setShowAttributesForFaceting(state, payload) {
            Vue.set(state, 'showAttributesForFaceting', payload);
        },
        setShowOnlyMatchingAttributes(state, payload) {
            Vue.set(state, 'showOnlyMatchingAttributes', payload);
        },
        setShowParamsAndSettings(state, payload) {
            Vue.set(state, 'showParamsAndSettings', payload);
        },
        setShowIndexSelector(state, payload) {
            Vue.set(state, 'showIndexSelector', payload);
        },
        setShowResultTabs(state, payload) {
            Vue.set(state, 'showResultTabs', payload);
        },
        setShowQueryInfo(state, payload) {
            Vue.set(state, 'showQueryInfo', payload);
        },
        rightFromLeft: function (state) {
            Vue.set(state.rightPanel, 'appId', state.leftPanel.appId);
            Vue.set(state.rightPanel, 'indexName', state.leftPanel.indexName);
            Vue.set(this.state.apps[state.rightPanel.appId], 'lastIndexName', state.rightPanel.indexName);
        },
        leftFromRight: function (state) {
            Vue.set(state.leftPanel, 'appId', state.rightPanel.appId);
            Vue.set(state.leftPanel, 'indexName', state.rightPanel.indexName);
            Vue.set(this.state.apps[state.leftPanel.appId], 'lastIndexName', state.leftPanel.indexName);
        },
        setQuery(state, payload) {
            Vue.set(state, 'query', payload);
        },
        setSplitMode(state, payload) {
            Vue.set(state, 'splitMode', payload);
        },
        jumpParams(state, payload) {
            let configKey = payload.configKey;
            const otherPanelKey = payload.panelKey === 'rightPanel' ? 'leftPanel': 'rightPanel';
            const srcAppId = state[payload.panelKey].appId;
            const srcIndexName = state[payload.panelKey].indexName;
            const dstAppId = state[otherPanelKey].appId;
            const dstIndexName = state[otherPanelKey].indexName;
            const srcParams = this.state.apps[srcAppId][srcIndexName][configKey]; // Keep before change of key

            if (configKey === 'searchParams2') {
                configKey = 'searchParams';
            } else if (configKey === 'searchParams' && srcAppId === dstAppId && srcIndexName === dstIndexName) {
                configKey = 'searchParams2';
            }

            const dstParamsData = this.state.apps[dstAppId][dstIndexName];

            Object.keys(srcParams).forEach((key) => {
                if (['replicas'].indexOf(key) !== -1) return;
                Vue.set(dstParamsData[configKey], key, JSON.parse(JSON.stringify(srcParams[key])));
            });
        },
        clearParams(state, payload) {
            let configKey = payload.configKey;
            const srcAppId = state[payload.panelKey].appId;
            const srcIndexName = state[payload.panelKey].indexName;
            const indexData = this.state.apps[srcAppId][srcIndexName]; // Keep before change of key
            Vue.set(indexData, configKey, {});
        },
        jumpParamValue(state, payload) {
            let configKey = payload.configKey;
            const otherPanelKey = payload.panelKey === 'rightPanel' ? 'leftPanel': 'rightPanel';
            const srcAppId = state[payload.panelKey].appId;
            const srcIndexName = state[payload.panelKey].indexName;
            const dstAppId = state[otherPanelKey].appId;
            const dstIndexName = state[otherPanelKey].indexName;
            const srcParams = this.state.apps[srcAppId][srcIndexName][configKey];

            if (configKey === 'searchParams2') {
                configKey = 'searchParams';
            } else if (configKey === 'searchParams' && srcAppId === dstAppId && srcIndexName === dstIndexName) {
                configKey = 'searchParams2';
            }

            const dstParams = this.state.apps[dstAppId][dstIndexName][configKey];

            Vue.set(dstParams, payload.inputKey, JSON.parse(JSON.stringify(srcParams[payload.inputKey])));
        },
    },
}
