import findOperation from "@/api-logs/findOperation";
import decodeUriComponent from 'decode-uri-component';

const extractQueryParams = function (rawLog) {
    const params = {
        bodies: [],
        rawBody: null,
        url: {},
        headers: {},
        all: {},
    };

    if (rawLog.query_body && rawLog.query_body.length > 0) {
        let paramsJSON;
        try {
            paramsJSON = JSON.parse(rawLog.query_body);
        } catch (e) {
            params.rawBody = rawLog.query_body;
        }

        if (paramsJSON) {
            let requests = [];
            if (paramsJSON.requests) requests = paramsJSON.requests;
            if (paramsJSON.params) requests = [paramsJSON];

            if (requests.length > 0) {
                requests.forEach((r) => {
                    const body = {...r};

                    if (body.params) {
                        const params2 = {};
                        body.params.split('&').forEach((e) => {
                            const parts = e.split('=');
                            params2[parts[0]] = parts[1];
                            params.all[parts[0]] = parts[1];
                        });
                        body.params = params2;
                        params.bodies.push(body);
                    } else {
                        params.rawBody = JSON.stringify(paramsJSON, null, 2);
                    }
                });
            } else {
                if (paramsJSON && typeof paramsJSON === 'object' && paramsJSON.constructor === Object && paramsJSON.query) {
                    Object.keys(paramsJSON).forEach((k) => {
                        params.all[k] = paramsJSON[k];
                    });
                    params.bodies.push(paramsJSON);
                } else {
                    params.rawBody = JSON.stringify(paramsJSON, null, 2);
                }
            }
        }
    }

    const urlsParts = rawLog.url.split('?');
    if (urlsParts.length > 1) {
        urlsParts[1].split('&').forEach((e) => {
            const parts = e.split('=');
            params.url[parts[0]] = parts[1];
            params.all[parts[0]] = parts[1];
        });
    }

    rawLog.query_headers.trim().split("\n").map((e) => {
        const parts = e.split(': ');
        params.headers[parts[0]] = parts[1];
        params.all[parts[0]] = parts[1];
    });

    return params;
};

export default function (rawLog) {
    // timestamp, method, answer_code, query_body, answer, url, ip, query_headers, nb_api_calls, processing_time_ms, index, query_params, query_nb_hits
    this.rawLog = rawLog;
    this.rawLogString = decodeUriComponent(`${rawLog.query_body} ${rawLog.answer} ${rawLog.url} ${rawLog.ip} ${rawLog.query_headers}`);
    this.id = rawLog.sha1;
    this.params = extractQueryParams(rawLog);
    this.verb = rawLog.method;
    this.path = rawLog.url.replace(/([^?]*)\??.*/, '$1');
    this.timestamp = rawLog.timestamp;
    this.verb = rawLog.method;
    this.url = rawLog.url;
    this.ip = rawLog.ip;
    this.answer_code = rawLog.answer_code;
    this.nb_operations = rawLog.nb_api_calls;
    this.processing_time_ms = rawLog.processing_time_ms;
    //this.operation = extractOperation(rawLog);

    this.response = rawLog.answer;

    this.operation = findOperation(this);
}