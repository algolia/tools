<template>
    <div>
        <h3 class="text-solstice-blue-opacity-80 mt-8 mb-16">Clusters</h3>
        <div v-if="clusters.length > 0">
            <table class="w-full">
                <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                    <td class="py-8 pr-32">Cluster name</td>
                    <td class="py-8 pr-32">Nb users</td>
                    <td class="py-8 pr-32">Nb records</td>
                    <td class="py-8 pr-32">Data Size</td>
                </tr>
                <tr v-for="cluster in clusters" class="border-t border-proton-grey-opacity-20">
                    <td class="py-8 pr-32">{{cluster.clusterName}}</td>
                    <td class="py-8 pr-32">{{numberWithCommas(cluster.nbUserIDs)}}</td>
                    <td class="py-8 pr-32">{{numberWithCommas(cluster.nbRecords)}}</td>
                    <td class="py-8 pr-32">{{formatHumanNumber(cluster.dataSize, 2, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                </tr>
            </table>
        </div>
        <div v-else>
            No clusters found
        </div>
        <h3 class="text-solstice-blue-opacity-80 mt-48 mb-16">Users</h3>
        <input
            v-model="query"
            placeholder="search users"
            class="px-8 bg-proton-grey-opacity-20 rounded py-8 text-telluric-blue"
        />
        <div v-if="users.length > 0">
            <table class="w-full mt-16">
                <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70 hit">
                    <td class="py-8 pr-32">User name</td>
                    <td class="py-8 pr-32">Cluster name</td>
                    <td class="py-8 pr-32">Nb records</td>
                    <td class="py-8 pr-32">Data Size</td>
                </tr>
                <tr v-for="user in users" class="border-t border-proton-grey-opacity-20 hit">
                    <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
                    <td class="py-8 pr-32" v-html="escapeHtml(user.userID)"></td>
                    <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
                    <td class="py-8 pr-32" v-html="escapeHtml(user.clusterName)"></td>
                    <td class="py-8 pr-32">{{numberWithCommas(user.nbRecords)}}</td>
                    <td class="py-8 pr-32">{{formatHumanNumber(user.dataSize, 2, ['B', 'KB', 'MB', 'GB'], 1000)}}</td>
                </tr>
            </table>
            <div class="flex">
                <pagination
                    v-if="query.length > 0"
                    class="mx-auto"
                    @onUpdatePage="page = $event"
                    :page="page"
                    :nb-pages="Math.ceil(nbHits / hitsPerPage)"
                />
            </div>
        </div>
        <div v-else>
            No users found
        </div>
    </div>
</template>

<script>
    import {formatHumanNumber, numberWithCommas, escapeHtml} from 'common/utils/formatters'
    import {getClient} from "common/utils/algoliaHelpers";
    import panelsMixin from "common/mixins/panelsMixin";
    import Pagination from "common/components/explorer/results/Pagination.vue";

    export default {
        name: 'Mcm',
        props: ['panelKey'],
        mixins: [panelsMixin],
        components: {Pagination},
        data: function () {
            return {
                clusters: [],
                users: [],
                formatHumanNumber,
                numberWithCommas,
                query: '9',
                page: 0,
                hitsPerPage: 20,
                nbHits: 1,
            };
        },
        watch: {
            query: function () { this.page = 0; this.refineUsers(); },
            page: function () { this.refineUsers(); },
        },
        created: function () {
            this.refineUsers();
            this.loadClusters();
        },
        methods: {
            loadClusters: async function () {
                const client = await getClient(this.panelAppId, this.panelAdminAPIKey, this.panelServer);
                const res = await client.listClusters();
                this.clusters = Object.freeze(res.clusters);
            },
            refineUsers: async function () {
                const client = await getClient(this.panelAppId, this.panelAdminAPIKey, this.panelServer);

                if (this.query.length === 0) {
                    const res = await client.getTopUserIDs();
                    const hits = [];
                    Object.keys(res.topUsers).forEach((clusterName) => {
                        hits.push(...res.topUsers[clusterName].map((user) => {
                            return {...user, clusterName};
                        }));
                    });
                    hits.sort((a, b) => b.dataSize - a.dataSize);
                    this.users = Object.freeze(hits);
                } else {
                    const res = await client.searchUserIDs(this.query, {page: this.page, hitsPerPage: this.hitsPerPage});
                    for (let i = 0; i < res.hits.length; i++) {
                        res.hits[i].userID = res.hits[i]._highlightResult.userID.value.replace('<b>', '<em>').replace('</b>', '</em>');
                        res.hits[i].clusterName = res.hits[i]._highlightResult.clusterName.value.replace('<b>', '<em>').replace('</b>', '</em>');
                    }
                    this.users = Object.freeze(res.hits);
                    this.nbHits = res.nbHits;
                }
            },
            escapeHtml,
        }
    }
</script>
