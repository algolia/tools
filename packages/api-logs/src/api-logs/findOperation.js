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
    new Operation('GET', '/1/indexes/:idx/task/:id', (logItem, idx, id) => `Get <code>status of task</code> ${id} for index <code>${idx}</code>`),
    new Operation('GET', '/1/version', () => 'Get version of the engine'),

    new Operation('GET', '/1/recommendation/personalization/strategy', () => '<code>Get perso strategy</code>'),
    new Operation('POST', '/1/recommendation/personalization/strategy', () => '<code>Set perso strategy</code>'),
    new Operation('GET', '/1/recommendation/personalization/users/:userID', (logItem, userID) => `<code>get perso profile</code> of user <code>${userID}</code>`),

    new Operation('PUT', '/1/keys/:key', (logItem, key) => `<code>Update API key</code> ${key}`),
    new Operation('POST', '/1/keys/:key/restore', (logItem, key) => `<code>Restore API key</code> ${key}`),
    new Operation('GET', '/1/keys', () => '<code>List API keys</code>'),
    new Operation('POST', '/1/keys', (logItem) => {
        const response = JSON.parse(logItem.response);
        const key = response.key ? ` ${response.key}` : '';
        return `<code>Add API key</code>${key}`;
    }),
    new Operation('DELETE', '/1/keys/:key', (logItem, key) => `<code>Delete API key</code> ${key}`),
    new Operation('GET', '/1/keys/:key', (logItem, key) => `<code>Get API key</code> ${key}`),

    new Operation('POST', '/1/indexes/:idx/keys', (logItem, idx) => {
        const response = JSON.parse(logItem.response);
        const key = response.key ? ` ${response.key}` : '';
        return `<code>Add index (${idx}) API key</code>${key}`
    }),
    new Operation('GET', '/1/indexes/:idx/keys', (logItem, idx) => `<code>List index API keys</code> for index <code>${idx}</code>`),
    new Operation('GET', '/1/indexes/:idx/keys/:key', (logItem, idx, key) => `<code>Get index (${idx}) API key</code> ${key}`),
    new Operation('PUT', '/1/indexes/:idx/keys/:key', (logItem, idx, key) => `<code>Update index (${idx}) API key</code> ${key}`),
    new Operation('DELETE', '/1/indexes/:idx/keys/:key', (logItem, idx, key) => `<code>Delete index (${idx}) API key</code> ${key}`),
    new Operation('GET', '/1/indexes/*/keys', () => '<code>List index API keys</code> for index *'),

    new Operation('GET', '/1/security/sources', () => '<code>List allowed sources</code>'),
    new Operation('DELETE', '/1/security/sources/:source', () => '<code>Delete one allowed source</code>'),
    new Operation('PUT', '/1/security/sources', () => '<code>Replace the list of allowed sources</code>'),
    new Operation('POST', '/1/security/sources/append', () => '<code>Add a source to the allowed sources</code>'),

    new Operation('POST', '/1/clusters/mapping', () => '<code>Assign userID to MCM cluster</code>'),
    new Operation('POST', '/1/clusters/mapping/search', () => '<code>Search userIDs</code>'),
    new Operation('GET', '/1/clusters', () => '<code>List MCM clusters</code>'),
    new Operation('GET', '/1/clusters/mapping/top', () => '<code>Get top userIDs</code>'),
    //new Operation('GET', '/1/clusters/mapping/configuration', () => '<code></code>'),
    new Operation('GET', '/1/clusters/mapping', () => '<code>List userIDs</code>'),
    new Operation('DELETE', '/1/clusters/mapping', () => '<code>Delete userID</code>'),
    new Operation('GET', '/1/clusters/mapping/:userID', (logItem, userID) => `<code>Get userID</code> <code>${userID}</code>`),

    new Operation('GET', '/1/indexes/:idx/settings', (logItem, idx) => `<code>Get settings</code> for index <code>${idx}</code>`),
    new Operation('PUT', '/1/indexes/:idx/settings', (logItem, idx) => `<code>Set settings</code> for index <code>${idx}</code>`),

    new Operation('POST', '/1/indexes/*/objects', () => 'Multiple Get objects'),
    new Operation('POST', '/1/indexes/:idx/clear', () => 'Clear objects'),
    new Operation('POST', '/1/indexes/:idx/batch', (logItem, idx) => {
        return `<code>Batch</code> ${logItem.nb_operations} objects in index <code>${idx}</code>`;
    }),
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
        const query = logItem.params.all.query && logItem.params.all.query.length > 0 ? logItem.params.all.query : '&lt;empty&gt;';
        return `<code>Search</code> in index <code>${idx}</code> for objects containing <code>"${query}"</code>`;
    }),
    new Operation('POST', '/1/indexes/*/queries', (logItem) => {
        const indices = logItem.params.bodies.map((r) => r.indexName);
        const queries = logItem.params.bodies.map((r) => r.params.query || '').filter((q) => q.length > 0);

        return `<code>Search</code> in indices ${indices.map((index) => `<code>${index}</code>`).join(', ')} for objects containing ${queries.map((q) => `<code>${q}</code>`).join(', ')}`;
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