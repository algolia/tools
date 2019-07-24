import findOperation from "@/api-logs/findOperation";


const extractQueryParams = function (rawLog) {
    const params = {};

    if (rawLog.query_body && rawLog.query_body.length > 0) {
        const paramsJSON = JSON.parse(rawLog.query_body);
        let paramsRaw = paramsJSON.params;

        if (paramsJSON.requests) {
            paramsRaw = paramsJSON.requests[0].params;
        }

        paramsRaw.split('&').forEach((e) => {
            const parts = e.split('=');
            params[parts[0]] = parts[1];
        });
    }

    if (rawLog.query_params) {
        rawLog.query_params.split('&').forEach((e) => {
            const parts = e.split('=');
            params[parts[0]] = parts[1];
        });
    }

    const urlParts = rawLog.url.split('?');
    const urlsParams = urlParts.length > 0 ? urlParts[1]: '';

    urlsParams.split('&').forEach((e) => {
        const parts = e.split('=');
        params[parts[0]] = parts[1];
    });

    rawLog.query_headers.trim().split("\n").map((e) => {
        const parts = e.split(': ');
        params[parts[0]] = parts[1];
    });

    return params;
};

const extractOperation = function (rawLogs) {

};


export default function (rawLog) {
    // timestamp, method, answer_code, query_body, answer, url, ip, query_headers, nb_api_calls, processing_time_ms, index, query_params, query_nb_hits
    this.rawLog = rawLog;
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