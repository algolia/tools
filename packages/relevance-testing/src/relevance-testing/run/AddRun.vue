<template>
    <div
        class="ml-8 px-40 border border-dashed border-telluric-blue-opacity-40 flex items-center justify-center h-full cursor-pointer text-telluric-blue"
        @click="addRun"
    >
        <div>
            Add a run
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AddRun',
        props: ['suite'],
        methods: {
            addRun: async function () {
                const apps = Object.keys(this.$store.state.apps);
                const appId = apps.length > 0 ? apps[0] : null;

                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT;
                const res = await fetch(`${endpoint}/relevance-testing/suites/${this.suite.id}/runs`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        app_id: appId,
                        index_name: null,
                        hits_per_page: 8,
                        params: '{}',
                    }),
                });

                const run = await res.json();
                run.params = JSON.parse(run.params);

                this.suite.runs.push(run);
                this.$emit('onAddRun');
            },
        },
    }
</script>
