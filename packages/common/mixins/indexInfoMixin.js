//import panelsMixin from "./panelsMixin";
import {algoliaParams} from '../utils/algoliaHelpers';

export default {
    computed: {
        indexCommitPrefix: function () {
            return `apps/${this.appId}/${this.indexName}`;
        },
        indexData: function () {
            if (!this.$store.state.apps[this.appId]) return null;
            return this.$store.state.apps[this.appId][this.indexName];
        },
        indexKeysIndexer: function () {
            if (this.indexData.keysIndexer) {
                return this.indexData.keysIndexer;
            }
            return null;
        },
        indexAutoTitleAttributeName: {
            get () {
                return this.indexData.autoTitleAttributeName;
            },
            set (value) {
                this.$store.commit(`${this.indexCommitPrefix}/setAutoTitleAttributeName`, value);
            }
        },
        indexTitleAttribute: {
            get () {
                return this.indexData.titleAttribute || '';
            },
            set (value) {
                this.$store.commit(`${this.indexCommitPrefix}/setTitleAttribute`, value);
            }
        },
        indexImageSize: {
            get () {
                return this.indexData.imageSize || 40;
            },
            set (value) {
                this.$store.commit(`${this.indexCommitPrefix}/setImageSize`, value);
            }
        },
        indexImageAttributeName: {
            get () {
                return this.indexData.imageAttributeName;
            },
            set (value) {
                this.$store.commit(`${this.indexCommitPrefix}/setImageAttributeName`, value);
            }
        },
        indexImageBaseUrl: {
            get () {
                return this.indexData.imageBaseUrl || '';
            },
            set (value) {
                this.$store.commit(`${this.indexCommitPrefix}/setImageBaseUrl`, value);
            }
        },
        indexImageSuffixUrl: {
            get () {
                return this.indexData.imageSuffixUrl || '';
            },
            set (value) {
                this.$store.commit(`${this.indexCommitPrefix}/setImageSuffixUrl`, value);
            }
        },
        searchParams: function () {
            return algoliaParams(this.indexData[this.searchConfigKey]);
        },
        indexSettings: function () {
            return algoliaParams(this.indexData.indexSettings || {});
        },
        refIndexSettings: function () {
            return algoliaParams(this.indexData.refIndexSettings || {});
        },
        advancedIndexSettings: function () {
            if (this.indexData && this.indexData.advancedIndexSettings) {
                return this.indexData.advancedIndexSettings;
            }
            return {};
        },
        indexSettingsRaw: function () {
            return this.indexData.indexSettings || {};
        },
        refIndexSettingsRaw: function () {
            return this.indexData.refIndexSettings || {};
        },
        searchParamsRaw: function () {
            return this.indexData[this.searchConfigKey];
        },
        isIndexSettingsDirty: function () {
            return JSON.stringify(this.indexSettings) !== JSON.stringify(this.refIndexSettings);
        },
        isReadOnly: function () {
            return this.indexData && this.refIndexSettings && this.refIndexSettings.primary && this.refIndexSettings.primary.length > 0;
        },
    }
}