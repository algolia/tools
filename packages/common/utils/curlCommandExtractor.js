import parse from 'bash-parser';
import paramsSpecs from 'common/params-specs/data.yml';

const isFakeArray = val => val.startsWith("[") && val.endsWith("]");

/**
 * make escaped JSON into non-escaped JSON
 * @param {string} data escaped JSON: "{\"\key": \"val\"}" or {\"\key": \"val\"}
 * @returns {string} unescpaed data: {"key": "val"}
 */
const removeEscapes = data => {
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
    if (paramsSpecs[k] && ['integer', 'boolean'].includes(paramsSpecs[k].value_type)) {
        if (v === 'false') return 0;
        if (v === 'true') return 1;

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

export function parseCurlCommand (command) {
    let ast = null;
    try {
        ast = parse(command.replace(/\\ /g, ' ')); // replace is to handle safari copy as curl
    } catch (e) {
        return null;
    }

    if (ast.type === 'Script' && ast.commands.length > 0 && ast.commands[0].type === 'Command' && ast.commands[0].name.text === 'curl') {
        const suffixes = ast.commands[0].suffix;

        let data = {};

        let pathName = '';
        let params = {};
        let url = '';
        let appId = '';
        let indexName = '';
        let machine = '';

        for (let i = 0; i < suffixes.length; i++) {
            if (suffixes[i].text === '-H' || suffixes[i].text === '--header') {
                i++;
                const headerString = suffixes[i].text;
                const split = headerString.split(': ');
                if (split[0] === 'x-algolia-user-token') params.userToken = split[1];
                continue;
            }
            if (suffixes[i].text.startsWith('http')) {
                url = suffixes[i].text;
                const urlObj = new URL(url);
                pathName = urlObj.pathname;
                const matches = urlObj.hostname.match(/(.*?)-(.*?)\.algolia\.?(net|io)(\.com)?/);

                if (matches) {
                    appId = matches[1].toUpperCase();
                    machine = `-${matches[2]}`;
                }
            }
            if (suffixes[i].text === '-d' || suffixes[i].text === '--data') {
                i++;
                data = decode(suffixes[i].text);
            }
        }

        if (url.length > 0) {
            if (pathName.match(/\/1\/indexes\/\*\/queries/) && data.requests && data.requests.length > 0) {
                const request = data.requests[0];
                if (request.indexName) {
                    indexName = request.indexName;
                }
                if (request.params) {
                    params = request.params
                }
            } else {
                const matches = pathName.match(/\1\/indexes\/(.*?)\/query/);
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
                const query = params.query || '';
                delete(params.query);

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
