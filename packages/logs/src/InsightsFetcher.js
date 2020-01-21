import decodeUriComponent from "decode-uri-component";
import {Operation} from "./api-logs/findOperation";

Date.prototype.addSeconds = function(s) {
    this.setTime(this.getTime() + (s*1000));
    return this;
};

export default function (appId, apiKey, indexName) {
    this.appId = appId;
    this.apiKey = apiKey;
    this.region = 'us';
    this.indexName = indexName;
    this.endpoint = `https://insights.${this.region}.algolia.io/1/events`;
    this.firstFetch = true;
    this.logs = [];

    this.fetchLogs = async function (allIndices) {
        const startDate = new Date().addSeconds(-3);
        const endDate = new Date().addSeconds(3);
        if (this.firstFetch) {
            this.firstFetch = false;
            startDate.addSeconds(-3600 * 12);
        }

        const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

        const res = await fetch(`${this.endpoint}${params}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Algolia-Application-Id': this.appId,
                'X-Algolia-Api-Key': this.apiKey,
            }
        });
        const json = await res.json();
        const logs = json.events.filter((rawlog) => allIndices || rawlog.event.index === this.indexName).slice(0, 1000).map((rawLog) => {
            return {
                server: '',
                rawLog: rawLog,
                rawLogString: JSON.stringify(rawLog),
                id: rawLog.requestID,
                params: {
                    bodies: [rawLog.event],
                    rawBody: JSON.stringify(rawLog.event),
                    url: {},
                    headers: {},
                    all: {},
                },
                verb: 'POST',
                path: '/1/events',
                timestamp: rawLog.receivedAt,
                date: new Date(rawLog.receivedAt),
                url: `https://insights.${this.region}.algolia.io/1/events`,
                ip: '',
                answer_code: rawLog.status.toString(),
                nb_operations: 1,
                processing_time_ms: '',
                response: '',
                operation: new Operation('POST', '/1/events', () => {
                    if (rawLog.errors.length > 0) {
                        return `Failing insights event`;
                    }
                    return `Report <code>${rawLog.event.eventType}</code> <code>${rawLog.event.eventName}</code> for userToken <code>${rawLog.event.userToken}</code>`;
                }),
                getQueries: () => [],
            };
        });

        if (logs.length > 0) {
            const lastLog = logs[logs.length - 1];
            const lastLogPos = this.logs.findIndex((log) => log.id === lastLog.id);

            const logsCopy = this.logs.slice();
            logsCopy.splice(0, lastLogPos + 1, ...logs);
            logsCopy.splice(1000);

            this.logs = logsCopy;
        }

        return this.logs;
    }
}
