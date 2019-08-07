import indexInfoMixin from "./indexInfoMixin";
import getSignature from "../utils/signature";

const clientCache = {};
const searchClientCache = {};
const indexCache = {};

export default {
    mixins: [indexInfoMixin],
    computed: {
        panelClient: function () {
            return this.algoliasearch(this.panelAppId, this.panelAdminAPIKey || ' ');
        },
        panelSearchClient: function () {
            if (this.panelServer === 'dsn') {
                return this.algoliasearch(this.panelAppId, this.panelAdminAPIKey || ' ', {
                    _useCache: false,
                });
            }

            const hosts = [];
            if (this.panelServer === '1') hosts.push(this.panelAppId + '-1.algolianet.com');
            if (this.panelServer === '2') hosts.push(this.panelAppId + '-2.algolianet.com');
            if (this.panelServer === '3') hosts.push(this.panelAppId + '-3.algolianet.com');

            return this.algoliasearch(this.panelAppId, this.panelAdminAPIKey || ' ', {
                hosts: hosts,
                _useCache: false,
            });
        },
    },
    methods: {
        getClient: async function () {
            if (clientCache[`${this.panelAppId}-${this.panelAdminAPIKey}`]) return clientCache[`${this.panelAppId}-${this.panelAdminAPIKey}`];
            const client = this.panelClient;
            this.signature = await getSignature(this.panelAppId);
            client.setExtraHeader('X-Algolia-Signature', this.signature);
            clientCache[`${this.panelAppId}-${this.panelAdminAPIKey}`] = client;
            return client;
        },
        getSearchClient: async function () {
            if (searchClientCache[`${this.panelAppId}-${this.panelAdminAPIKey}-${this.panelServer}`]) return searchClientCache[`${this.panelAppId}-${this.panelAdminAPIKey}-${this.panelServer}`];
            const client = this.panelSearchClient;
            this.signature = await getSignature(this.panelAppId);
            client.setExtraHeader('X-Algolia-Signature', this.signature);
            clientCache[`${this.panelAppId}-${this.panelAdminAPIKey}`] = client;
            return client;
        },
        getSearchIndex: async function () {
            if (indexCache[`${this.panelAppId}-${this.panelIndexName}-${this.panelServer}`]) return indexCache[`${this.panelAppId}-${this.panelIndexName}-${this.panelServer}`];
            const client = await this.getSearchClient();
            const index = client.initIndex(this.panelIndexName);
            indexCache[`${this.panelAppId}-${this.panelIndexName}`] = index;
            return index;
        },
    },
}