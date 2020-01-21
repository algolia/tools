import getClusterList from "common/components/selectors/getClusterList";
import {getClient} from "common/utils/algoliaHelpers";
import LogItem from "./api-logs/LogItem";

export default function (appId, apiKey) {
    this.appId = appId;
    this.apiKey = apiKey;
    this.servers = ['-1'];

    this.fetchLogs = async function (options, resetLogs) {
        if (resetLogs) this.logs = [];

        if (!this.appId) return;

        const logs = [];

        if (this.server === 'all') {
            const promises = [];
            for (let i = 0; i < this.servers.length; i++) {
                const client = await getClient(this.appId, this.apiKey, this.servers[i]);
                promises.push(client.getLogs({queryParameters: options}));
            }
            const responses = await Promise.all(promises);

            responses.forEach((res, i) => {
                logs.push(...res.logs.map(logItem => new LogItem(logItem, this.servers[i])));
            });

            logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        } else {
            const mainCluster = this.servers.length > 0 ? this.servers[0] : -1;
            const server = this.server === 'main cluster' ? mainCluster : this.server;
            const client = await getClient(this.appId, this.apiKey, server);
            const res = await client.getLogs({queryParameters: options});
            logs.push(...res.logs.map(logItem => new LogItem(logItem, server)));
        }

        return logs;
    };

    this.updateServerList = async function () {
        this.servers = await getClusterList(this.appId, true);
    };

    this.updateServerList();
}
