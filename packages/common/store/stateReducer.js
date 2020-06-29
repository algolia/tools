const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

export default function (state) {
    const {
        leftPanel,
        rightPanel,
        shareStatePanel,
        manageAppsPanel,
        showParamsAndSettings,
        showIndexSelector,
        showResultTabs,
        showQueryInfo,
        ...panelsRest
    } = state.panels;

    return Object.keys(state).reduce((acc, key) => ({
        ...acc,
        [key]: state[key],
        panels: {
            leftPanel: state.panels.leftPanel,
            rightPanel: state.panels.rightPanel,
            ...panelsRest
        },
        apps: Object.keys(state.apps).reduce((innerAcc, appId) => {
            const { key, ukey, lastIndexName, userId, __app_name, __app_owner, __app_uid, __log_region,  ...indexNames } = state.apps[appId];
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
                    ukey,
                    lastIndexName,
                    userId,
                    __app_name,
                    __app_owner,
                    __log_region,
                    __app_uid,
                })
            })
        }, {})
    }), {})
}
