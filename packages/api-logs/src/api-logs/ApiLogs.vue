<template>
    <div>
        LOGS
        <pre>
            {{JSON.stringify(logs, null, 2)}}
        </pre>
    </div>
</template>

<script>
    import algoliasearch from 'algoliasearch';

    export default {
        name: 'ApiLogs',
        data: function () {
            return {
                logs: [],
                client: algoliasearch('AJ0P3S7DWQ', 'ce1181300d403d21311d5bca9ef1e6fb')
            };
        },
        created: async function () {
            const res = await this.client.getLogs();
            this.logs = res.logs;
        }
    }
</script>