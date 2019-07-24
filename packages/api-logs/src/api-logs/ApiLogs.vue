<template>
    <div>
        <log
            v-for="log in logs"
            :key="log.sha1"
            :log-item="log"
        />
    </div>
</template>

<script>
    import algoliasearch from 'algoliasearch';
    import LogItem from "@/api-logs/LogItem";
    import Log from "@/api-logs/Log";

    export default {
        name: 'ApiLogs',
        components: {Log},
        data: function () {
            return {
                logs: [],
                client: algoliasearch('AJ0P3S7DWQ', 'ce1181300d403d21311d5bca9ef1e6fb'),
            };
        },
        created: async function () {
            const res = await this.client.getLogs();
            this.logs = res.logs.map((logItem) => {
                return new LogItem(logItem);
            });
        }
    }
</script>