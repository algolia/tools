import Vue from 'vue';

export default function () {
    return {
        namespaced: true,
        state: {
            searchParams: {},
            searchParams2: {},
            indexSettings: {},
            advancedIndexSettings: {},
            refIndexSettings: {},
            imageAttributeName: null,
            autoTitleAttributeName: null,
            titleAttribute: '',
            imageSize: 40,
            imageBaseUrl: '',
            imageSuffixUrl: '',
            lastUsed: new Date().getTime(),
        },
        mutations: {
            replaceIndexData(state, payload) {
                Object.keys(payload).forEach((key) => {
                    if (state[key] !== undefined) {
                        Vue.set(state, key, payload[key]);
                    }
                });
            },
            updateLastUsed: (state) => {
                state.lastUsed = new Date().getTime();
            },
            replaceIndexSettings(state, payload) {
                const settings = payload;
                Vue.set(state, 'indexSettings', {});
                Object.keys(settings).forEach(function (key) {
                    Vue.set(state.indexSettings, key, {value: settings[key], enabled: true});
                });

                Vue.set(state, 'refIndexSettings', JSON.parse(JSON.stringify(state.indexSettings)));
            },
            setImageSize(state, payload) {
                Vue.set(state, 'imageSize', payload);
            },
            setAutoTitleAttributeName(state, payload) {
                Vue.set(state, 'autoTitleAttributeName', payload);
            },
            setTitleAttribute(state, payload) {
                Vue.set(state, 'titleAttribute', payload);
            },
            resetIndexSettings(state) {
                Vue.set(state, 'indexSettings', JSON.parse(JSON.stringify(state.refIndexSettings)));
            },
            setImageAttributeName(state, payload) {
                Vue.set(state, 'imageAttributeName', payload);
            },
            setImageBaseUrl(state, payload) {
                Vue.set(state, 'imageBaseUrl', payload);
            },
            setImageSuffixUrl(state, payload) {
                Vue.set(state, 'imageSuffixUrl', payload);
            },
            restoreIndexSetting(state, payload) {
                const inputKey = payload.inputKey;
                Vue.set(state.indexSettings, inputKey, JSON.parse(JSON.stringify(state.refIndexSettings[inputKey])));
            },
            setAdvancedIndexSettings(state, payload) {
                Vue.set(state, 'advancedIndexSettings', payload);
            },
            setParamValue(state, payload) {
                const configKey = payload.configKey || this.state.edit.configKey;
                Vue.set(state[configKey], payload.key, {value: payload.value, enabled: true});
            },
            setParamEnabled(state, payload) {
                Vue.set(state[payload.configKey][payload.inputKey], 'enabled', payload.value);
            },
            deleteParam(state, payload) {
                Vue.delete(state[payload.configKey], payload.inputKey);
            },
            deleteArrayElement(state, payload) {
                Vue.delete(state[payload.configKey][payload.inputKey].value, payload.positionKey);
            },
            setKeysIndexer(state, payload) {
                Vue.set(state, 'keysIndexer', payload);
            },
            setIndexAnalyzer(state, payload) {
                Vue.set(state, 'indexAnalyzer', payload);
            },
        },
    }
}