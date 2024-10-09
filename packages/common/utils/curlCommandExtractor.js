import parseArgsStringToArgv from "string-argv";
import paramsSpecs from "common/params-specs/data.yml";

const isFakeArray = (val) => val.startsWith("[") && val.endsWith("]");

/**
 * Converts escaped JSON strings into unescaped JSON.
 * @param {string} data - Escaped JSON string.
 * @returns {string} Unescaped JSON string.
 */
const removeEscapes = (data) => {
    let decoded = data;
    if (decoded[0] === '"') {
        decoded = data.substr(1, data.length - 2);
    }
    if (decoded[1] === "\\") {
        decoded = decoded.replace(/\\"/g, '"');
    }
    return decoded;
};

const castValue = function (k, v) {
    if (
        paramsSpecs[k] &&
        ["integer", "boolean"].includes(paramsSpecs[k].value_type)
    ) {
        if (v === "false") return 0;
        if (v === "true") return 1;

        const parsedValue = parseInt(v);
        return isNaN(parsedValue) ? v : parsedValue;
    }
    return v;
};

const decode = function (data) {
    return JSON.parse(removeEscapes(data), (key, val) => {
        if (key === "params") {
            return Object.fromEntries(
                [...new URLSearchParams(val)].map(([k, v]) => {
                    if (isFakeArray(v)) {
                        return [k, JSON.parse(v)];
                    }
                    return [k, castValue(k, v)];
                })
            );
        }
        return val;
    });
};

/** example:
 * curl -X POST 'https://F4T6CUV2AH.algolianet.com/1/indexes/products/query' \
  -H 'Content-Type: application/json' \
  -H 'x-algolia-application-id: F4T6CUV2AH' \
  -d '{"params":"query=shoes"}'
 */

export function parseCurlCommand(command) {
    let argv = [];
    try {
        argv = parseArgsStringToArgv(command.replace(/\\ /g, " "));
    } catch (e) {
        return null;
    }

    if (argv.length > 0 && argv[0] === "curl") {
        let data = {};

        let pathName = "";
        let params = {};
        let url = "";
        let appId = "";
        let indexName = "";
        let machine = "";

        for (let i = 1; i < argv.length; i++) {
            const arg = argv[i];
            if (arg.startsWith("http")) {
                // Needs to be first so the application id header can overwrite the url app id
                url = arg;
                const urlObj = new URL(url);
                pathName = urlObj.pathname;
                const matches = urlObj.hostname.match(
                    /(.*?)-(.*?)\.algolia\.?(net|io)(\.com)?/
                );

                if (matches) {
                    appId = matches[1].toUpperCase();
                    machine = `-${matches[2]}`;
                }
                continue;
            }
            if (arg === "-H" || arg === "--header") {
                i++;
                if (i >= argv.length) break;
                const headerString = argv[i];
                const split = headerString.split(": ");
                if (split[0] === "x-algolia-user-token")
                    params.userToken = split[1];
                if (split[0] === "x-algolia-application-id") appId = split[1];
                continue;
            }
            if (["-d", "--data", "--data-binary", "--data-raw"].includes(arg)) {
                i++;
                if (i >= argv.length) break;
                data = decode(argv[i]);
                continue;
            }
        }

        if (url.length > 0) {
            if (
                pathName.match(/\/1\/indexes\/\*\/queries/) &&
                data.requests &&
                data.requests.length > 0
            ) {
                const request = data.requests[0];
                if (request.indexName) {
                    indexName = request.indexName;
                }
                if (request.params) {
                    params = request.params;
                }
            } else {
                const matches = pathName.match(/\/1\/indexes\/(.*?)\/query/);
                if (matches) {
                    indexName = matches[1];
                    if (data.params) {
                        params = data.params;
                    } else {
                        params = data;
                    }
                }
            }

            if (indexName) {
                const query = params.query || "";
                delete params.query;

                return {
                    appId,
                    indexName,
                    machine,
                    query,
                    params,
                };
            }
        }
    }
    return null;
}
