import panelsMixin from "./panelsMixin";

export default {
    mixins: [panelsMixin],
    computed: {
        panelAppId: function () {
            return this.$store.state.panels[this.panelKey].appId;
        },
        panelIndexName: function () {
            return this.$store.state.panels[this.panelKey].indexName;
        },
        panelAdminAPIKey: {
            get () {
                return this.$store.state.apps[this.panelAppId].key;
            },
            set(value) {
                this.$store.commit("apps/addAppId", {
                    appId: this.panelAppId,
                    apiKey: value,
                });
            }
        },
        panelIndexCommitPrefix: function () {
            return `apps/${this.panelAppId}/${this.panelIndexName}`;
        },
        panelIndexData: function () {
            return this.$store.state.apps[this.panelAppId][this.panelIndexName];
        },
        panelKeysIndexer: function () {
            if (this.panelIndexData.keysIndexer) {
                return this.panelIndexData.keysIndexer;
            }
            return null;
        },
        panelAutoTitleAttributeName: {
            get () {
                return this.panelIndexData.autoTitleAttributeName;
            },
            set (value) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setAutoTitleAttributeName`, value);
            }
        },
        panelTitleAttribute: {
            get () {
                return this.panelIndexData.titleAttribute || '';
            },
            set (value) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setTitleAttribute`, value);
            }
        },
        panelImageSize: {
            get () {
                return this.panelIndexData.imageSize || 40;
            },
            set (value) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setImageSize`, value);
            }
        },
        panelImageAttributeName: {
            get () {
                return this.panelIndexData.imageAttributeName;
            },
            set (value) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setImageAttributeName`, value);
            }
        },
        panelImageBaseUrl: {
            get () {
                return this.panelIndexData.imageBaseUrl || '';
            },
            set (value) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setImageBaseUrl`, value);
            }
        },
        panelImageSuffixUrl: {
            get () {
                return this.panelIndexData.imageSuffixUrl || '';
            },
            set (value) {
                this.$store.commit(`${this.panelIndexCommitPrefix}/setImageSuffixUrl`, value);
            }
        },
        searchParams: function () {
            return this.algoliaParams(this.panelIndexData[this.searchConfigKey]);
        },
        indexSettings: function () {
            return this.algoliaParams(this.panelIndexData.indexSettings || {});
        },
        refIndexSettings: function () {
            return this.algoliaParams(this.panelIndexData.refIndexSettings || {});
        },
        advancedIndexSettings: function () {
            if (this.panelIndexData && this.panelIndexData.advancedIndexSettings) {
                return this.panelIndexData.advancedIndexSettings;
            }
            return {};
        },
        indexSettingsRaw: function () {
            return this.panelIndexData.indexSettings || {};
        },
        refIndexSettingsRaw: function () {
            return this.panelIndexData.refIndexSettings || {};
        },
        searchParamsRaw: function () {
            return this.panelIndexData[this.searchConfigKey];
        },
        isIndexSettingsDirty: function () {
            return JSON.stringify(this.indexSettings) !== JSON.stringify(this.refIndexSettings);
        },
        isReplica: function () {
            return this.refIndexSetting && this.refIndexSettings.primary && this.refIndexSettings.primary.length > 0;
        },
        isReadOnly: function () {
            return this.isReplica;
        },
    },
    methods: {
        algoliaParams: function (params) {
            const algoliaParams = {};

            Object.keys(params).forEach(function (key) {
                if (params[key].enabled && key !== 'optionalWords=query') {
                    algoliaParams[key] = params[key].value;
                }
            });

            return JSON.parse(JSON.stringify(algoliaParams));
        }
    }
}