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
                const metrics = [];

                this.config.usage.enabledGraphs.forEach((group) => {
                    metrics.push(...group.metrics);
                });

                return metrics;
            },
            usagePeriod: function () {
                return this.config.usage.period;
            }
        },
        methods: {
            fetchIndexUsage: async function () {
                if (this.usageMetrics.length <= 0) {
                    return this.$emit('onUpdateUsage', {
                        appId: this.appId,
                        indexName: this.indexName,
                        usage: {},
                    });
                }
                const usageApiKey = this.$store.state.apps[this.appId].ukey;

                if (usageApiKey) {
                    let usagePeriodToFetch = this.usagePeriod === 'week' ? 'year' : this.usagePeriod;

                    const res = await fetch(`https://usage.algolia.com/1/usage/${this.usageMetrics.join(',')}/period/${usagePeriodToFetch}/${this.indexName}`, {
                        headers: {
                            'X-Algolia-Application-Id': this.appId,
                            'X-Algolia-API-Key': usageApiKey,
                        },
                    });
                    let usage = await res.json();
                    if (usage.status === 404) return;

                    if (this.usagePeriod === 'week') {
                        usage = Object.keys(usage).reduce((acc, key) => {
                            return {
                                ...acc,
                                [key]: usage[key].slice(358),
                            }
                        }, {});
                    }

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
