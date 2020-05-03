export default [
    {
        name: 'Search operations',
        metrics: [
            'queries_operations',
            'multi_queries_operations',
            'browse_operations',
            'get_record_operations',
        ]
    },
    {
        name: 'Records operations',
        metrics : [
            'add_record_operations',
            'batch_operations',
            'delete_by_query_operations',
            'delete_record_operations',
            'partial_update_record_operations',
            'update_record_operations',
        ]
    },
    {
        name: 'Synonyms operations',
        metrics: [
            'batch_synonym_operations',
            'clear_synonym_operations',
            'delete_synonym_operations',
            'get_synonym_operations',
            'query_synonym_operations',
            'update_synonym_operations',
        ]
    },
    {
        name: 'Indexing operations',
        metrics: [
            'clear_index_operations',
            'copy_move_operations',
            'delete_index_operations',
            'get_log_operations',
            'get_settings_operations',
            'list_indices_operations',
            'set_settings_operations',
            'wait_task_operations',
        ]
    },
    {
        name: 'Rules operations',
        metrics: [
            'batch_rules_operations',
            'clear_rules_operations',
            'delete_rules_operations',
            'get_rules_operations',
            'save_rules_operations',
            'search_rules_operations',
        ]
    },
    {
        name: 'Keys operations',
        metrics: [
            'get_api_key_operations',
            'get_api_keys_operations',
            'add_api_key_operations',
            'update_api_key_operations',
            'delete_api_key_operations',
            'list_api_key_operations',
        ]
    },
    {
        name: 'Records',
        metrics: [
            'records',
        ]
    },
    {
        name: 'Data Size',
        metrics: [
            'data_size',
            'file_size',
        ]
    },
    {
        name: 'Processing time',
        metrics: [
            'avg_processing_time',
            '90p_processing_time',
            '99p_processing_time',
        ]
    },
    {
        name: 'Degraded queries',
        metrics: [
            'degraded_queries_ssd_used_queries_impacted',
            'degraded_queries_ssd_used_seconds_impacted',
            'degraded_queries_max_capacity_queries_impacted',
            'degraded_queries_max_capacity_seconds_impacted',
        ]
    },
    {
        name: 'Search capacity',
        metrics: [
            'used_search_capacity',
            'region_used_search_capacity',
            'total_used_search_capacity',
        ]
    },
    {
        name: 'QPS',
        metrics: [
            'queries_above_last_ms_processing_time',
            'max_qps',
            'region_max_qps',
            'total_max_qps',
        ],
    },
    {
        name: 'Insights',
        metrics: [
            'insights_operations',
        ]
    },
    /*{
        metrics: [
            '*',
            'total_search_operations',
            'total_acl_operations',
            'total_indexing_operations',
            'total_records_operations',
            'total_synonym_operations',
            'total_rules_operations',
            'total_write_operations',
            'total_read_operations',
            'total_operations',
        ]
    },*/
]
