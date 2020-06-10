import decodeUriComponent from "decode-uri-component";
import {Operation} from "./api-logs/findOperation";

Date.prototype.addSeconds = function(s) {
    this.setTime(this.getTime() + (s*1000));
    return this;
};

export default function (appId, apiKey, indexName, region) {
    this.appId = appId;
    this.apiKey = apiKey;
    this.indexName = indexName;

    this.fetchLogs = async function (allIndices) {
        const startDate = new Date().addSeconds(-3600 * 12);
        const endDate = new Date().addSeconds(3);

        const params = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

        const endpoint = `https://insights.${region}.algolia.io/1/events`;
        const res = await fetch(`${endpoint}${params}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Algolia-Application-Id': this.appId,
                'X-Algolia-Api-Key': this.apiKey,
            }
        });
        const json = await res.json();

        // rawlog.event = EventType, EventName, Index, ObjectIDs, Positions, Filters, UserToken, QueryID, Timestamp
        const logs = json.events.filter((rawlog) => allIndices || rawlog.event.index === this.indexName).slice(0, 1000).map((rawLog) => {
            return {
                server: '',
                rawLog: rawLog,
                rawLogString: JSON.stringify(rawLog),
                id: rawLog.requestID,
                params: {
                    bodies: rawLog.event ? [rawLog.event] : [],
                    rawBody: JSON.stringify(rawLog.event),
                    url: {},
                    headers: {},
                    all: {},
                },
                verb: 'POST',
                path: rawLog.path,
                timestamp: rawLog.receivedAt,
                date: new Date(rawLog.receivedAt),
                url: `https://insights.${region}.algolia.io/1/events`,
                ip: '',
                answer_code: rawLog.status.toString(),
                nb_operations: 1,
                processing_time_ms: '',
                response: rawLog.errors.join(' '),
                operation: new Operation('POST', rawLog.path, () => {
                    if (!rawLog.event) {
                        return `Failing insights event`;
                    }

                    let type = rawLog.event.eventType;
                    if (!type) {
                        if (rawLog.path.endsWith('/click')) type = 'click';
                        if (rawLog.path.endsWith('/conversion')) type = 'conversion';
                    }

                    let s = 'Report ';
                    s += `<code>${type}</code> `;
                    if (rawLog.event.eventName) {
                        s += `<code>${rawLog.event.eventName}</code> `;
                    }
                    if (rawLog.event.objectIDs) {
                        s += `on ${rawLog.event.objectIDs.length} objectIDs `;
                    }
                    if (rawLog.event.filters) {
                        s += `on ${rawLog.event.filters.length} filters `;
                    }
                    if (rawLog.event.userToken) {
                        s += `<br><br>userToken=<code>${rawLog.event.userToken}</code> `;
                    }
                    if (rawLog.event.index) {
                        s += `index=<code>${rawLog.event.index}</code> `;
                    }
                    if (rawLog.event.queryID) {
                        s += `queryID=<code>${rawLog.event.queryID}</code> `;
                    }

                    return s;
                }),
                getQueries: () => [],
            };
        });

        return logs;
    }
}
