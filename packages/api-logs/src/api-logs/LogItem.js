{ngx_algolia_search_post_operation,                      LOG_ACTION_OPERATION,                         MAIN_ONLY,   "/1/indexes/:idx/operation",          WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_post_acl,                            LOG_ACTION_ADD_ACL,                           MAIN_ONLY,   "/1/keys",                            WITH_BODY,    ALLOWED_PLACES,     SSL_ONLY,     FORWARD},
{ngx_algolia_search_post_partial_update,                 LOG_ACTION_PARTIAL_UPDATE_OBJECT,             MAIN_ONLY,   "/1/indexes/:idx/:id/partial",        WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     WITH_USERID},
{ngx_algolia_search_post_allowed_sources,                LOG_ACTION_ADD_ALLOWED_SOURCE,                MAIN_ONLY,   "/1/security/sources/append",         WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_post_clusters_mapping,               LOG_ACTION_POST_CLUSTER_MAPPING,              MAIN_ONLY,   "/1/clusters/mapping",                WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     WITH_USERID},
{ngx_algolia_search_post_mapping_search,                 LOG_ACTION_POST_CLUSTER_MAPPING_SEARCH,       DSN_ALLOWED, "/1/clusters/mapping/search",         WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_post_clusters_mapping_configuration, LOG_ACTION_PUT_CLUSTER_MAPPING_CONFIGURATION, MAIN_ONLY,   "/1/clusters/mapping/configuration",  WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},


{ngx_algolia_search_get_indexes,                         LOG_ACTION_LIST_INDEXES,                      DSN_ALLOWED, "/1/indexes",                         WITHOUT_BODY, ALLOWED_PLACES,     SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_mquery,                          LOG_ACTION_QUERIES,                           DSN_ALLOWED, "/1/indexes/*",                       WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITH_USERID},
{ngx_algolia_search_get_query,                           LOG_ACTION_QUERY,                             DSN_ALLOWED, "/1/indexes/:idx",                    WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITH_USERID},

{ngx_algolia_search_get_indexes_stats,                   LOG_ACTION_STATS,                             DSN_ALLOWED, "/1/indexes/*/stats",                 WITHOUT_BODY, ALLOWED_PLACES,     ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_indexes_top,                     LOG_ACTION_ADMIN_LIST_INDEXES,                DSN_ALLOWED, "/1/indexes/*/top",                   WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_browse,                          LOG_ACTION_BROWSE,                            DSN_ALLOWED, "/1/indexes/:idx/browse",             WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITH_USERID},
{ngx_algolia_search_get_index_acls,                      LOG_ACTION_GET_ACLS,                          DSN_ALLOWED, "/1/indexes/:idx/keys",               WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_index_acl,                       LOG_ACTION_GET_ACL,                           DSN_ALLOWED, "/1/indexes/:idx/keys/:key",          WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_index_synonym,                   LOG_ACTION_GET_SYNONYM,                       DSN_ALLOWED, "/1/indexes/:idx/synonyms/:id",       WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_object,                          LOG_ACTION_GET_OBJECT,                        DSN_ALLOWED, "/1/indexes/:idx/:id",                WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITH_USERID},
{ngx_algolia_search_get_task,                            LOG_ACTION_GET_TASK,                          DSN_ALLOWED, "/1/indexes/:idx/task/:id",           WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITH_USERID},
{ngx_algolia_search_get_acls,                            LOG_ACTION_GET_ACLS,                          DSN_ALLOWED, "/1/keys",                            WITHOUT_BODY, ALLOWED_PLACES,     SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_logs,                            LOG_ACTION_USER_LOGS,                         DSN_ALLOWED, "/1/logs",                            WITHOUT_BODY, ALLOWED_PLACES,     SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_version,                         LOG_ACTION_VERSION,                           DSN_ALLOWED, "/1/version",                         WITHOUT_BODY, ALLOWED_PLACES,     ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_acl,                             LOG_ACTION_GET_ACL,                           DSN_ALLOWED, "/1/keys/:key",                       WITHOUT_BODY, ALLOWED_PLACES,     SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_analytics_auth,                  LOG_ACTION_ANALYTICS_AUTH,                    DSN_ALLOWED, "/1/analytics/auth",                  WITHOUT_BODY, ALLOWED_PLACES,     SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_places_query,                    LOG_ACTION_PLACES_QUERY,                      DSN_ALLOWED, "/1/places/query",                    WITHOUT_BODY, IS_PLACES,          ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_places_reverse,                  LOG_ACTION_PLACES_REVERSE,                    DSN_ALLOWED, "/1/places/reverse",                  WITHOUT_BODY, IS_PLACES,          ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_places_object,                   LOG_ACTION_PLACES_QUERY,                      DSN_ALLOWED, "/1/places/:id",                      WITHOUT_BODY, IS_PLACES,          ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_allowed_sources,                 LOG_ACTION_GET_ALLOWED_SOURCES,               DSN_ALLOWED, "/1/security/sources",                WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_clusters,                        LOG_ACTION_GET_CLUSTERS,                      DSN_ALLOWED, "/1/clusters",                        WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_clusters_mapping_top,            LOG_ACTION_GET_CLUSTER_MAPPING_TOP,           DSN_ALLOWED, "/1/clusters/mapping/top",            WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_clusters_mapping_configuration,  LOG_ACTION_GET_CLUSTER_MAPPING_STRATEGY,      DSN_ALLOWED, "/1/clusters/mapping/configuration",  WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_clusters_mapping,                LOG_ACTION_GET_CLUSTER_MAPPING,               DSN_ALLOWED, "/1/clusters/mapping/:userID",        WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_clusters_mappings,               LOG_ACTION_GET_CLUSTER_MAPPINGS,              DSN_ALLOWED, "/1/clusters/mapping",                WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_rule,                            LOG_ACTION_RULES_GET,                         DSN_ALLOWED, "/1/indexes/:idx/rules/:id",          WITHOUT_BODY, NOT_ALLOWED_PLACES, ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_auth,                            LOG_ACTION_AUTH,                              DSN_ALLOWED, "/1/auth",                            WITHOUT_BODY, ALLOWED_PLACES,     ALLOW_NO_SSL, WITHOUT_USERID},
{ngx_algolia_search_get_admin_ab_tests,                  LOG_ACTION_AB_TEST_LIST,                      DSN_ALLOWED, "/1/admin/abtest/:idx",               WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_reco_strategy,                   LOG_ACTION_RECO_GET_STRATEGY,                 DSN_ALLOWED, "",
    WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_admin_reco_strategy,             LOG_ACTION_RECO_GET_ADMIN_STRATEGY,           DSN_ALLOWED, "/1/admin/recommendation/personalization/strategy",
    WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_reco_user,                       LOG_ACTION_RECO_GET_USER,                     DSN_ALLOWED, "/1/recommendation/personalization/users/:userID",
    WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_admin_index_size,                LOG_ACTION_ADMIN_GET_INDEX_SIZE,              MAIN_ONLY,   "/1/admin/indexes/:idx/size",         WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITHOUT_USERID},
{ngx_algolia_search_get_isalive,                         LOG_ACTION_IS_ALIVE,                          DSN_ALLOWED, "/1/isalive",                         WITHOUT_BODY, ALLOWED_PLACES,     ALLOW_NO_SSL, WITHOUT_USERID}
{ngx_algolia_search_delete_index,                        LOG_ACTION_DELETE_INDEX,                      MAIN_ONLY,   "/1/indexes/:idx",                    WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_delete_object,                       LOG_ACTION_DELETE_OBJECT,                     MAIN_ONLY,   "/1/indexes/:idx/:id",                WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITH_USERID},
{ngx_algolia_search_delete_acl,                          LOG_ACTION_DELETE_ACL,                        MAIN_ONLY,   "/1/keys/:key",                       WITHOUT_BODY, ALLOWED_PLACES,     SSL_ONLY,     FORWARD},
{ngx_algolia_search_delete_index_acl,                    LOG_ACTION_DELETE_ACL,                        MAIN_ONLY,   "/1/indexes/:idx/keys/:key",          WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_delete_index_synonym,                LOG_ACTION_DELETE_SYNONYM,                    MAIN_ONLY,   "/1/indexes/:idx/synonyms/:id",       WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_delete_allowed_sources,              LOG_ACTION_DELETE_ALLOWED_SOURCE,             MAIN_ONLY,   "/1/security/sources/:source",        WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_delete_rule,                         LOG_ACTION_RULES_DELETE,                      MAIN_ONLY,   "/1/indexes/:idx/rules/:id",          WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_delete_clusters_mapping,             LOG_ACTION_POST_CLUSTER_MAPPING,              MAIN_ONLY,   "/1/clusters/mapping",                WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     WITH_USERID},
{ngx_algolia_search_delete_admin_ab_test,                LOG_ACTION_AB_TEST_DELETE,                    MAIN_ONLY,   "/1/admin/abtest/:idx",               WITHOUT_BODY, NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD}
{ngx_algolia_search_put_settings,                        LOG_ACTION_UPDATE_SETTINGS,                   MAIN_ONLY,   "/1/indexes/:idx/settings",           WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_put_object,                          LOG_ACTION_UPDATE_OBJECT,                     MAIN_ONLY,   "/1/indexes/:idx/:id",                WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     WITH_USERID},
{ngx_algolia_search_put_acl,                             LOG_ACTION_UPDATE_ACL,                        MAIN_ONLY,   "/1/keys/:key",                       WITH_BODY,    ALLOWED_PLACES,     SSL_ONLY,     FORWARD},
{ngx_algolia_search_put_index_acl,                       LOG_ACTION_UPDATE_ACL,                        MAIN_ONLY,   "/1/indexes/:idx/keys/:key",          WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_put_index_synonym,                   LOG_ACTION_UPDATE_SYNONYM,                    MAIN_ONLY,             "/1/indexes/:idx/synonyms/:id",       WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_put_allowed_sources,                 LOG_ACTION_REPLACE_ALLOWED_SOURCES,           MAIN_ONLY,   "/1/security/sources",                WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD},
{ngx_algolia_search_put_rule,                            LOG_ACTION_RULES_SAVE,                        MAIN_ONLY,   "/1/indexes/:idx/rules/:id",          WITH_BODY,    NOT_ALLOWED_PLACES, SSL_ONLY,     FORWARD}
{ngx_algolia_search_post_places_query,                   LOG_ACTION_PLACES_QUERY,                      DSN_ALLOWED, "/1/places/query",                    WITH_BODY,    IS_PLACES,          ALLOW_NO_SSL, WITHOUT_USERID},

const operations = [
    ['POST', '/1/indexes/:idx/query', 'Search objects in index'],
    ['POST', '/1/indexes/*/queries', 'Search objects in multiple indices'],
    ['POST', '/1/indexes/:idx/analyze', 'Analyse index'],
    ['POST', '/1/indexes/:idx/browse', 'Browse records'],
    ['POST', '/1/indexes/:idx/facets/:facet/query', 'Search for facet values'],

    ['GET', '/1/indexes/:idx/settings', 'Get settings'],

    ['POST', '/1/indexes/:idx', 'Save object'],
    ['POST', '/1/indexes/*/objects', 'Get objects'],
    ['POST', '/1/indexes/:idx/clear', 'Clear objects'],
    ['POST', '/1/indexes/:idx/batch', 'Batch objects'],
    ['POST', '/1/indexes/:idx/deleteByQuery', 'Delete by query'],

    ['POST', '/1/indexes/:idx/synonyms/clear', 'Clear synonyms'],
    ['POST', '/1/indexes/:idx/synonyms/batch', 'Batch synonyms'],
    ['POST', '/1/indexes/:idx/synonyms/search', 'Search synonyms'],

    ['POST', '/1/indexes/:idx/rules/batch', 'Batch rules'],
    ['POST', '/1/indexes/:idx/rules/clear', 'Clear rules'],
    ['POST', '/1/indexes/:idx/rules/search', 'Search rules'],

    ['POST', '/1/recommendation/personalization/strategy', 'set personalisation strategy'],

    ['GET', '/1/indexes/*/keys', 'List API keys'],
    ['POST', '/1/indexes/:idx/keys', 'Add API key'],
    ['POST', '/1/keys/:key/restore', 'Restore API key'],
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