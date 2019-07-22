// ['GET', '/1/indexes/*/stats', ''],
// ['GET', '/1/indexes/*/top', ''],
//
// ['GET', '/1/version', ''],
// ['GET', '/1/analytics/auth', ''],
// ['GET', '/1/auth', ''],
//
// ['GET', '/1/indexes/*', ''],
// ['GET', '/1/indexes/:idx', ''],
// ['GET', '/1/recommendation/personalization/users/:userID', ''],
// ['POST', '/1/clusters/mapping/configuration', ''],

const operations = [
    ['GET', '/1/isalive', 'Is alive'],
    ['GET', '/1/logs', 'Get logs'],
    ['GET', '/1/indexes/:idx/task/:id', 'Get task status'],

    ['POST', '/1/indexes/:idx/query', 'Search objects in index'],
    ['POST', '/1/indexes/*/queries', 'Search objects in multiple indices'],
    ['POST', '/1/indexes/:idx/analyze', 'Analyse index'],
    ['POST', '/1/indexes/:idx/browse', 'Browse records'],
    ['GET', '/1/indexes/:idx/browse', 'Browse records'],
    ['POST', '/1/indexes/:idx/facets/:facet/query', 'Search for facet values'],

    ['GET', '/1/indexes/:idx/settings', 'Get settings'],
    ['PUT', '/1/indexes/:idx/settings', 'Set settings'],

    ['POST', '/1/indexes/:idx', 'Add/update object'],
    ['GET', '/1/indexes/:idx/:id', 'Get Object'],
    ['PUT', '/1/indexes/:idx/:id', 'Update object'],
    ['POST', '/1/indexes/*/objects', 'Multiple Get objects'],
    ['POST', '/1/indexes/:idx/clear', 'Clear objects'],
    ['POST', '/1/indexes/:idx/batch', 'Batch objects'],
    ['DELETE', '/1/indexes/:idx/:id', 'Delete Object'],
    ['POST', '/1/indexes/:idx/deleteByQuery', 'Delete by query'],
    ['POST', '/1/indexes/:idx/:id/partial', 'Partial update object'],

    ['POST', '/1/indexes/:idx/operation', 'Copy/Move index'],
    ['GET', '/1/indexes', 'List indices'],
    ['DELETE', '/1/indexes/:idx', 'Delete index'],

    ['DELETE', '/1/indexes/:idx/synonyms/:id', 'Delete synonyms'],
    ['POST', '/1/indexes/:idx/synonyms/clear', 'Clear synonyms'],
    ['POST', '/1/indexes/:idx/synonyms/batch', 'Batch synonyms'],
    ['POST', '/1/indexes/:idx/synonyms/search', 'Search synonyms'],
    ['GET', '/1/indexes/:idx/synonyms/:id', 'Get synonym'],
    ['PUT', '/1/indexes/:idx/synonyms/:id', 'Add/Update synonym'],

    ['DELETE', '/1/indexes/:idx/rules/:id', 'Delete Rule'],
    ['POST', '/1/indexes/:idx/rules/batch', 'Batch rules'],
    ['POST', '/1/indexes/:idx/rules/clear', 'Clear rules'],
    ['POST', '/1/indexes/:idx/rules/search', 'Search rules'],
    ['GET', '/1/indexes/:idx/rules/:id', 'Get rule'],
    ['PUT', '/1/indexes/:idx/rules/:id', 'Put rule'],

    ['POST', '/1/recommendation/personalization/strategy', 'set personalisation strategy'],

    ['PUT', '/1/keys/:key', 'Update API key'],
    ['POST', '/1/keys/:key/restore', 'Restore API key'],
    ['GET', '/1/keys', 'List API keys'],
    ['POST', '/1/keys', 'Add API key'],
    ['DELETE', '/1/keys/:key', 'Delete API key'],
    ['GET', '/1/keys/:key', 'Get API key'],

    ['GET', '/1/indexes/*/keys', 'List index API keys for all indices'],
    ['POST', '/1/indexes/:idx/keys', 'Add index API key'],
    ['GET', '/1/indexes/:idx/keys', 'List index API keys for index'],
    ['GET', '/1/indexes/:idx/keys/:key', 'Get index API key'],
    ['PUT', '/1/indexes/:idx/keys/:key', 'Update index API key'],
    ['DELETE', '/1/indexes/:idx/keys/:key', 'Delete index API key'],

    ['GET', '/1/security/sources', 'List allowed sources'],
    ['DELETE', '/1/security/sources/:source', 'Delete one allowed source'],
    ['PUT', '/1/security/sources', 'Replace the list of allowed sources'],
    ['POST', '/1/security/sources/append', 'Add a source to the allowed sources'],

    ['POST', '/1/clusters/mapping', 'Assign userID to MCM cluster'],
    ['POST', '/1/clusters/mapping/search', 'Search userIDs'],
    ['GET', '/1/clusters', 'List MCM clusters'],
    ['GET', '/1/clusters/mapping/top', 'Get top userIDs'],
    ['GET', '/1/clusters/mapping/configuration', ''],
    ['GET', '/1/clusters/mapping/:userID', 'Get userID'],
    ['GET', '/1/clusters/mapping', 'List userIDs'],
    ['DELETE', '/1/clusters/mapping', 'Delete userID'],
];


const extractQueryParams = function (queryParams) {
    return {};
};

const extractOperation = function (rawLogs) {

};


export default function (rawLog) {
    // timestamp, method, answer_code, query_body, answer, url, ip, query_headers, nb_api_calls, processing_time_ms, index, query_params, query_nb_hits
    this.params = extractQueryParams(rawLog.query_params);
    this.operation = extractOperation(rawLog);

    this.toString = function () {

    }
}