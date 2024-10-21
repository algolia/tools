<template>
  <div>
    <div
      v-if="indexInfo"
      class="flex items-center text-sm text-solstice-blue-opacity-80"
    >
      <div class="border-b border-dotted border-telluric-blue-opacity-60">
        Records: {{ numberWithCommas(indexInfo.entries) }}
      </div>
      <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12">
        Index size: {{ formatHumanNumber(indexInfo.fileSize, 2, ['B', 'KB', 'MB', 'GB'], 1000) }}
      </div>
      <div
        v-if="avgRecordSize > 5000"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        Avg record size: {{ formatHumanNumber(avgRecordSize, 2, ['B', 'KB', 'MB', 'GB'], 1000) }}
      </div>
      <div
        v-if="nbBuildingJobs > 0"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        Index jobs: {{ nbBuildingJobs }}
      </div>
      <div
        v-if="sumBuildingJobs > 0"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        App jobs: {{ sumBuildingJobs }}
      </div>
      <div
        v-if="nbShards > 1 || indexInfo.fileSize > 2048000000"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        Nb Shards: {{ nbShards }}
      </div>
      <div
        v-if="replicas.length > 0"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        replicas: {{ replicas.length }}
      </div>
      <div
        v-if="indexSettings.primary"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        Primary: {{ indexSettings.primary }}
      </div>
      <div
        v-if="indexSettings.primary && isVirtual"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        Virtual: {{ isVirtual }}
      </div>
      <div
        v-if="$store.state.apps[panelAppId].__log_region"
        class="border-b border-dotted border-telluric-blue-opacity-60 ml-12"
      >
        Logs region: {{ $store.state.apps[panelAppId].__log_region }}
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
        components: {},
        mixins: [indexInfoMixin, panelsMixin],
        props: ['panelKey'],
        data: function () {
            return {
                indexInfo: null,
                buildingIndices: {},
                formatHumanNumber: formatHumanNumber,
                numberWithCommas: numberWithCommas,
            }
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
            },
            isVirtual: function(){
                return this.indexInfo.virtual == 1;
            }
        },
        watch: {
            panelAppId: function (o, n) { if (o !== n) this.fetchIndexData(this.panelIndexName); },
            panelIndexName: function (o, n) { if (o !== n) this.fetchIndexData(this.panelIndexName); },
            panelServer: function (o, n) { if (o !== n) this.fetchIndexData(this.panelIndexName); },
        },
        created: function () {
            this.fetchBuildingIndices();
            this.fetchIndexData(this.panelIndexName);

            window.setInterval(() => {
                this.fetchBuildingIndices();
                this.fetchIndexData(this.panelIndexName);
            }, 15000);
        },
        methods: {
            fetchIndexData: async function (indexName) {
                if (!this.indexData) return;

                try {
                    const client = await getClient(this.panelAppId, this.panelAdminAPIKey, this.panelServer);
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
                } catch(e) {
                    console.warn("listIndices ignored due to apiKey restrictions", e)
                }
            },
            fetchBuildingIndices: async function () {
                if (!this.indexData) return;

                try {
                    const client = await getClient(this.panelAppId, this.panelAdminAPIKey, this.panelServer);
                    const data = await client.transporter.write({
                        method: 'GET',
                        path: '1/indexes/*/stats',
                    });
                    this.buildingIndices = data.building;
                } catch(e) {
                    console.warn("buildingIndices call ignored due to apiKey restrictions", e)
                }
            }
        }
    }
</script>
