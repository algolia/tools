<template>
    <div>
        <div class="flex items-center pl-16 bg-white rounded border border-proton-grey-opacity-80 h-40">
            <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
            <input
                class="flex-1 block h-full bg-transparent text-telluric-blue leading-normal"
                placeholder="Search customer name, appId, server"
                ref="search"
                v-model="query"
            >
        </div>
        <div v-if="query.length > 0">
            <template v-for="key in infras.__keys__">
                <infra :infra="infras[key]" />
            </template>
        </div>
    </div>
</template>

<script>
    import {getKey} from "common/components/selectors/getClusterList";
    import SearchIcon from "common/icons/search.svg";
    import algoliasearch from 'algoliasearch';
    import {getInfraFromMachine, getInfras} from "./helpers";
    import Infra from "./Infra";

    export default {
        name: 'Inspect',
        components: {Infra, SearchIcon},
        data: function () {
            return {
                appIndex: null,
                userIndex: null,
                query: '',
                infras: {},
                requestNumber: 0,
                requestNumberReceived: 0,
            }
        },
        watch: {
            query: function () {
                this.search();
            }
        },
        created: async function () {
            const key = await getKey();
            const client = algoliasearch('X20GSLY1CL', key);
            this.appIndex = client.initIndex('applications_production');
            this.userIndex = client.initIndex('users_production');
            this.search();
        },
        methods: {
            search: async function () {
                const requestNumber = this.requestNumber++;

                const res = await this.appIndex.search(this.query, {
                    page: 0,
                    hitsPerPage: 100,
                    filters: 'deleted:false',
                    disableTypoToleranceOnAttributes: ['clusters_and_replicas_names'],
                    allowTyposOnNumericTokens: false,
                    typoTolerance: 'min',
                });

                const hits = res.hits;

                const clusterNames = hits.map((hit) => hit.cluster_name);
                const infras = await getInfras(clusterNames, this.query);

                if (this.requestNumberReceived > requestNumber) return;
                this.requestNumberReceived = requestNumber;

                this.infras = infras;
            }
        }
    }
</script>
