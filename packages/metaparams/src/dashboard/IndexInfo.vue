<template>
    <div>
        <div v-if="indexInfo" class="flex items-center text-sm text-solstice-blue-opacity-80">
            <div class="border-b border-dotted border-telluric-blue-opacity-60">
                Records: {{numberWithCommas(indexInfo.entries)}}
            </div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12">
                Index size: {{formatHumanNumber(indexInfo.fileSize, 2, ['B', 'KB', 'MB', 'GB'], 1000)}}
            </div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
                 v-if="avgRecordSize > 5000"
            >
                Avg record size: {{formatHumanNumber(avgRecordSize, 2, ['B', 'KB', 'MB', 'GB'], 1000)}}
            </div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
                 v-if="nbBuildingJobs > 0"
            >
                Index jobs: {{nbBuildingJobs}}
            </div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
                 v-if="sumBuildingJobs > 0"
            >
                App jobs: {{sumBuildingJobs}}
            </div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
                 v-if="nbShards > 1 || indexInfo.fileSize > 2048000000"
            >
                Nb Shards: {{nbShards}}
            </div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
                 v-if="replicas.length > 0"
            >
                replicas: {{replicas.length}}
            </div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
                 v-if="indexSettings.primary"
            >
                Primary: {{indexSettings.primary}}
            </div>
        </div>
    </div>
</template>

<script>
    import {formatHumanNumber, numberWithCommas} from "common/utils/formatters"
    import {getClient} from 'common/utils/algoliaHelpers';
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'IndexInfo',
        props: ['panelKey'],
        mixins: [indexInfoMixin, panelsMixin],
        components: {},
        data: function () {
            return {
                indexInfo: null,
                buildingIndices: {},
                formatHumanNumber: formatHumanNumber,
                numberWithCommas: numberWithCommas,
            }
        },
        watch: {
            panelAppId: function (o, n) { if (o !== n) this.fetchIndexData(this.panelIndexName); },
            panelIndexName: function (o, n) { if (o !== n) this.fetchIndexData(this.panelIndexName); },
        },
        created: function () {
            this.fetchBuildingIndices();
            this.fetchIndexData(this.panelIndexName);

            window.setInterval(() => {
                this.fetchBuildingIndices();
                this.fetchIndexData(this.panelIndexName);
            }, 15000);
        },
        computed: {
            appId: function () { // Needed for indexInfoMixin
                return this.panelAppId;
            },
            indexName: function () { // Needed for indexInfoMixin
                return this.panelIndexName;
            },
            avgRecordSize: function () {
                return this.indexInfo.entries ? this.indexInfo.dataSize / this.indexInfo.entries : 0;
            },
            replicas: function () {
                return this.indexSettings.replicas || [];
            },
            sumBuildingJobs: function () {
                let sum = 0;
                for (let key in this.buildingIndices) {
                    sum += this.buildingIndices[key];
                }
                return sum;
            },
            nbBuildingJobs: function () {
                return this.buildingIndices[this.panelIndexName] || 0;
            },
            nbShards: function () {
                if (!this.advancedIndexSettings) return 1;
                return this.advancedIndexSettings.nbShardsAuto > 1 ? this.advancedIndexSettings.nbShardsAuto : (this.indexSettings.nbShards || 1);
            }
        },
        methods: {
            fetchIndexData: async function (indexName) {
                if (!this.indexData) return;

                const client = await getClient(this.panelAppId, this.panelAdminAPIKey);
                const res = await client.listIndices({
                    queryParameters: {
                        page: 0, prefix: indexName
                    }
                });

                res.items.forEach((indexInfo) => {
                    if (indexInfo.name === indexName) {
                        this.indexInfo = indexInfo;
                    }
                });

                this.$emit('onUpdateHasNoRecord', this.indexInfo !== null && this.indexInfo.entries === 0);
            },
            fetchBuildingIndices: async function () {
                if (!this.indexData) return;

                const client = await getClient(this.panelAppId, this.panelAdminAPIKey);
                const data = await client.transporter.write({
                    method: 'GET',
                    path: '1/indexes/*/stats',
                });

                this.buildingIndices = data.building;
            }
        }
    }
</script>
