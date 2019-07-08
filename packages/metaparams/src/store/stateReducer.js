const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

export default function (state) {
    const leftRest = function () {
        const { algoliaResponse, ...leftRest } = state.panels.leftPanel;
        return leftRest;
    }();

    const rightRest = function () {
        const { algoliaResponse, ...rightRest } = state.panels.rightPanel;
        return rightRest;
    }();

    const {
        leftPanel,
        rightPanel,
        shareStatePanel,
        manageAppsPanel,
        ...panelsRest
    } = state.panels;

    return Object.keys(state).reduce((acc, key) => ({
        ...acc,
        [key]: state[key],
        panels: {
            leftPanel: leftRest,
            rightPanel: rightRest,
            ...panelsRest
        },
        apps: Object.keys(state.apps).reduce((innerAcc, appId) => {
            const { key, lastIndexName, ...indexNames } = state.apps[appId];
            return ({
                ...innerAcc,
                [appId]: Object.keys(indexNames).reduce((innerInnerAcc, indexName) => {
                    const  {
                        indexSettings,
                        refIndexSettings,
                        advancedIndexSettings,
                        keysIndexer,
                        indexAnalyzer,
                        autoTitleAttributeName,
                        ...rest
                    } = state.apps[appId][indexName];

                    const now = new Date().getTime();
                    const lastUsed = rest.lastUsed || oneWeekAgo.getTime();
                    const nbDaysSinceLastUse = Math.floor((now - lastUsed) / 1000 / 3600 / 24);

                    if (nbDaysSinceLastUse >= 7) {
                        return innerInnerAcc;
                    }

                    return {...innerInnerAcc, [indexName]: rest}
                }, {
                    key,
                    lastIndexName
                })
            })
        }, {})
    }), {})
}