import { escapeHtml } from "../../../common/utils/formatters";

export class Operation {
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
    new Operation('GET', '/1/indexes/:idx/task/:id', (logItem, idx, id) => `Get <code>status of task</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),
    new Operation('GET', '/1/version', () => 'Get version of the engine'),

    new Operation('GET', '/1/recommendation/personalization/strategy', () => '<code>Get perso strategy</code>'),
    new Operation('POST', '/1/recommendation/personalization/strategy', () => '<code>Set perso strategy</code>'),
    new Operation('GET', '/1/recommendation/personalization/users/:userID', (logItem, userID) => `<code>get perso profile</code> of user <code>${escapeHtml(userID)}</code>`),

    new Operation('PUT', '/1/keys/:key', (logItem, key) => `<code>Update API key</code> ${escapeHtml(key)}`),
    new Operation('POST', '/1/keys/:key/restore', (logItem, key) => `<code>Restore API key</code> ${escapeHtml(key)}`),
    new Operation('GET', '/1/keys', () => '<code>List API keys</code>'),
    new Operation('POST', '/1/keys', (logItem) => {
        const response = JSON.parse(logItem.response);
        const key = response.key ? ` ${response.key}` : '';
        return `<code>Add API key</code>${escapeHtml(key)}`;
    }),
    new Operation('DELETE', '/1/keys/:key', (logItem, key) => `<code>Delete API key</code> ${escapeHtml(key)}`),
    new Operation('GET', '/1/keys/:key', (logItem, key) => `<code>Get API key</code> ${escapeHtml(key)}`),

    new Operation('POST', '/1/indexes/:idx/keys', (logItem, idx) => {
        const response = JSON.parse(logItem.response);
        const key = response.key ? ` ${response.key}` : '';
        return `<code>Add index (${escapeHtml(idx)}) API key</code>${escapeHtml(key)}`
    }),
    new Operation('GET', '/1/indexes/:idx/keys', (logItem, idx) => `<code>List index API keys</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('GET', '/1/indexes/:idx/keys/:key', (logItem, idx, key) => `<code>Get index (${escapeHtml(idx)}) API key</code> ${escapeHtml(key)}`),
    new Operation('PUT', '/1/indexes/:idx/keys/:key', (logItem, idx, key) => `<code>Update index (${escapeHtml(idx)}) API key</code> ${escapeHtml(key)}`),
    new Operation('DELETE', '/1/indexes/:idx/keys/:key', (logItem, idx, key) => `<code>Delete index (${escapeHtml(idx)}) API key</code> ${escapeHtml(key)}`),
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
    new Operation('GET', '/1/clusters/mapping/:userID', (logItem, userID) => `<code>Get userID</code> <code>${escapeHtml(userID)}</code>`),

    new Operation('GET', '/1/indexes/:idx/settings', (logItem, idx) => `<code>Get settings</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('PUT', '/1/indexes/:idx/settings', (logItem, idx) => `<code>Set settings</code> for index <code>${escapeHtml(idx)}</code>`),

    new Operation('POST', '/1/indexes/:idx/operation', (logItem, idx) => `<code>Copy/Move index</code> ${escapeHtml(idx)}`),
    new Operation('GET', '/1/indexes', () => 'List indices'),

    new Operation('DELETE', '/1/indexes/:idx/synonyms/:id', (logItem, idx, id) => `<code>Delete synonym</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/synonyms/clear', (logItem, idx) => `<code>Clear synonyms</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/synonyms/batch', (logItem, idx) => `<code>Batch ${escapeHtml(logItem.nb_operations)} synonyms</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/synonyms/search', (logItem, idx) => `Search synonyms in index <code>${escapeHtml(idx)}</code>`),
    new Operation('GET', '/1/indexes/:idx/synonyms/:id', (logItem, idx, id) => `<code>Get synonym</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),
    new Operation('PUT', '/1/indexes/:idx/synonyms/:id', (logItem, idx, id) => `<code>Add/Update synonym</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),

    new Operation('DELETE', '/1/indexes/:idx/rules/:id', (logItem, idx, id) => `<code>Delete rule</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/rules/batch', (logItem, idx) => `<code>Batch ${escapeHtml(logItem.nb_operations)} rules</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/rules/clear', (logItem, idx) => `<code>Clear rules</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/rules/search', (logItem, idx) => `Search rules in index <code>${escapeHtml(idx)}</code>`),
    new Operation('GET', '/1/indexes/:idx/rules/:id', (logItem, idx, id) => `<code>Get rule</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),
    new Operation('PUT', '/1/indexes/:idx/rules/:id', (logItem, idx, id) => `<code>Add/Update rule</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),

    new Operation('POST', '/1/indexes/*/objects', () => 'Multiple Get objects'),
    new Operation('POST', '/1/indexes/:idx/clear', (logItem, idx) => `<code>Clear objects</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/batch', (logItem, idx) => `<code>Batch</code> ${escapeHtml(logItem.nb_operations)} objects in index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/deleteByQuery', (logItem, idx) => `<code>Delete by query</code> for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/:id/partial', (logItem, idx, id) => `<code>Partial update object</code> ${escapeHtml(id)} for index <code>${escapeHtml(idx)}</code>`),


    new Operation('POST', '/1/indexes/:idx/query', (logItem, idx) => {
        let s = `<code>Search</code> in index <code>${escapeHtml(idx)}</code> for objects containing <code>"${escapeHtml(logItem.getQueries()[0])}"</code>`;
        if (logItem.queryID) {
            s += `<br><br>queryID=<code>${escapeHtml(logItem.queryID)}</code>`;
        }
        return s;
    }),
    new Operation('POST', '/1/indexes/*/queries', (logItem) => {
        const indices = logItem.params.bodies.map((r) => r.indexName);

        let s = `<code>Search</code> in indices ${indices.map((index) => `<code>${escapeHtml(index)}</code>`).join(', ')} for objects containing ${logItem.getQueries().map((q) => `<code>${escapeHtml(q)}</code>`).join(', ')}`;
        if (logItem.queryID) {
            s += `<br><br>queryID=<code>${escapeHtml(logItem.queryID)}</code>`;
        }
        return s;
    }),
    new Operation('POST', '/1/indexes/:idx/analyze', (logItem, idx) => `<code>Analyse index</code> <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/browse', (logItem, idx) => `Browse records for index <code>${escapeHtml(idx)}</code>`),
    new Operation('GET', '/1/indexes/:idx/browse', (logItem, idx) => `Browse records for index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx/facets/:facet/query', (logItem, idx, facet) => `<code>Search for facet values</code> <code>${escapeHtml(facet)}</code> in index <code>${escapeHtml(idx)}</code>`),
    new Operation('GET', '/1/indexes/*', () => 'Multiple search queries'),


    new Operation('DELETE', '/1/indexes/:idx/:id', (logItem, idx, id) => `<code>Delete object</code> ${escapeHtml(id)} in index <code>${escapeHtml(idx)}</code>`),
    new Operation('DELETE', '/1/indexes/:idx', (logItem, idx) => `<code>Delete index</code> <code>${escapeHtml(idx)}</code>`),

    new Operation('GET', '/1/indexes/:idx/:id', (logItem, idx, id) => `<code>Get object</code> ${escapeHtml(id)} in index <code>${escapeHtml(idx)}</code>`),
    new Operation('GET', '/1/indexes/:idx', (logItem, idx) => `Search objects in index <code>${escapeHtml(idx)}</code>`),

    new Operation('PUT', '/1/indexes/:idx/:id', (logItem, idx, id) => `<code>Update object</code> ${escapeHtml(id)} in index <code>${escapeHtml(idx)}</code>`),
    new Operation('POST', '/1/indexes/:idx', (logItem, idx) => `<code>Add/update object</code> in index <code>${escapeHtml(idx)}</code>`),
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
