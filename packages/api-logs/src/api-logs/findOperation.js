class Operation {
    constructor(verb, path, toStringFunc) {
        this.verb = verb;
        this.path = path;

        this.regex = new RegExp(path.replace(/\/\*/g, '/\\*').replace(/(\/:[a-zA-Z]*)/g, '/(.*?)') + '$');

        this.toStringFunc = (logItem) => {
            const matches = this.regex.exec(logItem.path);
            matches.shift();
            return toStringFunc(logItem, ...matches);
        }
    }
    match(logItem) {
        return logItem.verb === this.verb && this.regex.test(logItem.path);
    }
}

const operations = [
    new Operation('GET', '/1/isalive', () => 'Is alive'),
    new Operation('GET', '/1/logs', () => 'Get logs'),
    new Operation('GET', '/1/indexes/:idx/task/:id', () => 'Get task status'),
    new Operation('GET', '/1/version', () => 'Get version of the engine'),

    new Operation('POST', '/1/recommendation/personalization/strategy', () => 'set personalisation strategy'),
    new Operation('GET', '/1/recommendation/personalization/users/:userID', () => 'get user profile'),

    new Operation('PUT', '/1/keys/:key', () => 'Update API key'),
    new Operation('POST', '/1/keys/:key/restore', () => 'Restore API key'),
    new Operation('GET', '/1/keys', () => 'List API keys'),
    new Operation('POST', '/1/keys', () => 'Add API key'),
    new Operation('DELETE', '/1/keys/:key', () => 'Delete API key'),
    new Operation('GET', '/1/keys/:key', () => 'Get API key'),

    new Operation('POST', '/1/indexes/:idx/keys', () => 'Add index API key'),
    new Operation('GET', '/1/indexes/:idx/keys', (logItem, idx) => {
        return `List index API keys for index ${idx}`;
    }),
    new Operation('GET', '/1/indexes/:idx/keys/:key', () => 'Get index API key'),
    new Operation('PUT', '/1/indexes/:idx/keys/:key', () => 'Update index API key'),
    new Operation('DELETE', '/1/indexes/:idx/keys/:key', () => 'Delete index API key'),
    new Operation('GET', '/1/indexes/*/keys', () => 'List index API keys for all indices'),

    new Operation('GET', '/1/security/sources', () => 'List allowed sources'),
    new Operation('DELETE', '/1/security/sources/:source', () => 'Delete one allowed source'),
    new Operation('PUT', '/1/security/sources', () => 'Replace the list of allowed sources'),
    new Operation('POST', '/1/security/sources/append', () => 'Add a source to the allowed sources'),

    new Operation('POST', '/1/clusters/mapping', () => 'Assign userID to MCM cluster'),
    new Operation('POST', '/1/clusters/mapping/search', () => 'Search userIDs'),
    new Operation('GET', '/1/clusters', () => 'List MCM clusters'),
    new Operation('GET', '/1/clusters/mapping/top', () => 'Get top userIDs'),
    new Operation('GET', '/1/clusters/mapping/configuration', () => ''),
    new Operation('GET', '/1/clusters/mapping', () => 'List userIDs'),
    new Operation('DELETE', '/1/clusters/mapping', () => 'Delete userID'),
    new Operation('GET', '/1/clusters/mapping/:userID', () => 'Get userID'),

    new Operation('GET', '/1/indexes/:idx/settings', () => 'Get settings'),
    new Operation('PUT', '/1/indexes/:idx/settings', () => 'Set settings'),

    new Operation('POST', '/1/indexes/*/objects', () => 'Multiple Get objects'),
    new Operation('POST', '/1/indexes/:idx/clear', () => 'Clear objects'),
    new Operation('POST', '/1/indexes/:idx/batch', () => 'Batch objects'),
    new Operation('POST', '/1/indexes/:idx/deleteByQuery', () => 'Delete by query'),
    new Operation('POST', '/1/indexes/:idx/:id/partial', () => 'Partial update object'),

    new Operation('POST', '/1/indexes/:idx/operation', () => 'Copy/Move index'),
    new Operation('GET', '/1/indexes', () => 'List indices'),

    new Operation('DELETE', '/1/indexes/:idx/synonyms/:id', () => 'Delete synonyms'),
    new Operation('POST', '/1/indexes/:idx/synonyms/clear', () => 'Clear synonyms'),
    new Operation('POST', '/1/indexes/:idx/synonyms/batch', () => 'Batch synonyms'),
    new Operation('POST', '/1/indexes/:idx/synonyms/search', () => 'Search synonyms'),
    new Operation('GET', '/1/indexes/:idx/synonyms/:id', () => 'Get synonym'),
    new Operation('PUT', '/1/indexes/:idx/synonyms/:id', () => 'Add/Update synonym'),

    new Operation('DELETE', '/1/indexes/:idx/rules/:id', () => 'Delete Rule'),
    new Operation('POST', '/1/indexes/:idx/rules/batch', () => 'Batch rules'),
    new Operation('POST', '/1/indexes/:idx/rules/clear', () => 'Clear rules'),
    new Operation('POST', '/1/indexes/:idx/rules/search', () => 'Search rules'),
    new Operation('GET', '/1/indexes/:idx/rules/:id', () => 'Get rule'),
    new Operation('PUT', '/1/indexes/:idx/rules/:id', () => 'Put rule'),

    new Operation('POST', '/1/indexes/:idx/query', (logItem, idx) => {
        const query = logItem.params.query.length > 0 ? logItem.params.query : '<empty>';
        return `Search objects containing "${query}" in index "${idx}"`;
    }),
    new Operation('POST', '/1/indexes/*/queries', (logItem) => {
        const queryBody = JSON.parse(logItem.query_body);
        const indices = queryBody.requests.map((r) => r.indexName);

        return `Search objects in multiple indices: ${indices.join(', ')}`
    }),
    new Operation('POST', '/1/indexes/:idx/analyze', () => 'Analyse index'),
    new Operation('POST', '/1/indexes/:idx/browse', () => 'Browse records'),
    new Operation('GET', '/1/indexes/:idx/browse', () => 'Browse records'),
    new Operation('POST', '/1/indexes/:idx/facets/:facet/query', () => 'Search for facet values'),
    new Operation('GET', '/1/indexes/*', () => 'Multiple search queries'),


    new Operation('DELETE', '/1/indexes/:idx/:id', () => 'Delete Object'),
    new Operation('DELETE', '/1/indexes/:idx', () => 'Delete index'),

    new Operation('GET', '/1/indexes/:idx/:id', () => 'Get Object'),
    new Operation('GET', '/1/indexes/:idx', () => 'Search objects in index'),

    new Operation('PUT', '/1/indexes/:idx/:id', () => 'Update object'),
    new Operation('POST', '/1/indexes/:idx', () => 'Add/update object'),
];

export default function (logItem) {
    let i;
    for (i = 0; i < operations.length; i++) {
        if (operations[i].match(logItem)) {
            return operations[i];
        }
    }

    return new Operation(logItem.verb, logItem.path, () => 'Unknown operation');
}