<template></template>

<script>
    import searchIndexer from 'common/local-search-engine/dumbIndexer';
    import analyseIndex from 'common/utils/indexAnalyzer';
    import paramsSpecs from 'common/params-specs';

    import {getClient} from "common/utils/algoliaHelpers";
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import getSignature from "../../../utils/signature";

    export default {
        name: 'SettingsLoader',
        props: ['appId', 'indexName', 'apiKey'],
        mixins: [
            indexInfoMixin,
        ],
        data: function () {
            return {
                advancedIndexSettingsNames: ['indexingGeolocPrecision','maxNbHits', 'nbShardsAuto','approxSubstIsBetter','maxApproxIVSizeForEachWord','maxApproxWords'],
            };
        },
        watch: {
            appId: function () { this.init(); },
            indexName: function () { this.init(); },
            apiKey: function () { this.init(); },
        },
        created: function () {
            if (!this.appId || !this.indexName || !this.apiKey) return;
            this.init();
        },
        methods: {
            init: function () {
                this.loadIndexSettings();
                this.loadKeysIndexer();
            },
            loadIndexSettings: async function () {
                const client = await getClient(this.appId, this.apiKey);
                const index = client.customInitIndex(this.indexName);
                const indexSettings = await index.getSettings({ queryParameters: {advanced: 1}});

                const settings = {};
                const advancedSettings = {};
                let key;
                for (key in indexSettings) {
                    if (key === 'version') continue;
                    if (key === 'userData') continue;
                    if (key === 'nbShards' && indexSettings[key] === 1) continue;
                    if (this.advancedIndexSettingsNames.indexOf(key) !== -1) {
                        advancedSettings[key] = indexSettings[key];
                        continue;
                    }

                    if (paramsSpecs[key] === undefined
                        || paramsSpecs[key].settings_default === undefined
                        || JSON.stringify(indexSettings[key]) !== JSON.stringify(paramsSpecs[key].settings_default)
                    ) {
                        if (paramsSpecs[key] === undefined || paramsSpecs[key].ignore_value === undefined
                            || JSON.stringify(indexSettings[key]) !== JSON.stringify(paramsSpecs[key].ignore_value)
                        ) {
                            settings[key] = indexSettings[key];
                        }
                    }
                }

                this.$emit('onFetchSettings', settings);
                this.$store.commit(`apps/${this.appId}/${this.indexName}/replaceIndexSettings`, settings);
                this.$store.commit(`apps/${this.appId}/${this.indexName}/setAdvancedIndexSettings`, advancedSettings);
            },
            loadKeysIndexer: async function () {
                if (!this.appId || !this.apiKey);

                const signature = await getSignature(this.appId);
                const analyze = await analyseIndex(this.appId, this.apiKey, this.indexName, signature);
                const keysIndexer = new searchIndexer();
                analyze.keys.forEach(function (key) {
                    keysIndexer.addString(key);
                });

                this.$store.commit(`apps/${this.appId}/${this.indexName}/setIndexAnalyzer`, analyze);
                this.$store.commit(`apps/${this.appId}/${this.indexName}/setKeysIndexer`, keysIndexer);
            }
        }
    }
</script>
