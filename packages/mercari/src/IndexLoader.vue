<template>

</template>

<script>
    import algoliasearch from 'algoliasearch';

    export default {
        name: 'IndexLoader',
        props: ['appId', 'indexName', 'config'],
        created: function () {
            this.fetchSettings();
            this.fetchIndexUsage();
        },
        watch: {
            usageMetrics: function () { this.fetchIndexUsage(); },
            usagePeriod: function () { this.fetchIndexUsage(); },
        },
        computed: {
            adminAPIKey: function () {
                if (this.$store.state.apps[this.appId]) return this.$store.state.apps[this.appId].key;
                return null;
            },
            usageMetrics: function () {
                return this.config.usageMetrics;
            },
            usagePeriod: function () {
                return this.config.usagePeriod;
            }
        },
        methods: {
            fetchIndexUsage: async function () {
                const usageApiKey = this.$store.state.apps[this.appId].ukey;
                if (usageApiKey) {
                    const res = await fetch(`https://usage.algolia.com/1/usage/${this.usageMetrics.join(',')}/period/${this.usagePeriod}/${this.indexName}`, {
                        headers: {
                            'X-Algolia-Application-Id': this.appId,
                            'X-Algolia-API-Key': usageApiKey,
                        },
                    });
                    const usage = await res.json();
                    if (usage.status === 404) return;

                    this.$emit('onUpdateUsage', {
                        appId: this.appId,
                        indexName: this.indexName,
                        usage: usage,
                    });
                }
            },
            fetchSettings: async function () {
                const client = algoliasearch(this.appId, this.adminAPIKey);
                const algoliaIndex = client.initIndex(this.indexName);
                const res = await algoliaIndex.getSettings({queryParameters: {advanced: 1}});
                const settings = {
                    'nbShards': res.nbShardsAuto > 1 ? res.nbShardsAuto : (res.nbShards || 1),
                }
                this.$emit('onUpdateSettings', {
                    appId: this.appId,
                    indexName: this.indexName,
                    settings: settings,
                });
            },
        }
    }
</script>
