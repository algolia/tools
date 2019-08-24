<template>
    <div class="p-8 h-120">
        <div class="text-telluric-blue text-xs flex items-center">
            <div>
                <app-selector v-model="run.app_id" />
                <index-selector v-model="run.index_name" :app-id="run.app_id" />
                <div v-if="suite.reports[runPosition]" class="flex">
                    <!--<badge class="mr-16" :passing="suite.reports[i].passing" />-->
                    <div>{{suite.reports[runPosition].nbPassing}} / {{suite.reports[runPosition].nbTests}}</div>
                </div>
                <div @click="suite.runRun(run, runPosition)">Run</div>
                <div class="mt-8">
                    <trash-icon
                        @click="deleteRun"
                        class="w-12 h-12 block cursor-pointer text-solstice-blue"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';

    import TrashIcon from 'common/icons/trash.svg';

    export default {
        name: 'EditRun',
        props: ['suite', 'run', 'runPosition'],
        components: {AppSelector, IndexSelector, TrashIcon},
        watch: {
            run: {
                deep: true,
                handler () {
                    if (this.$store.state.apps[this.run.app_id]) {
                        this.run.api_key = this.$store.state.apps[this.run.app_id].key;
                    }
                    this.suite.runRun(this.run, this.runPosition);
                    this.updateRun();
                }
            },
        },
        methods: {
            updateRun: async function () {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/runs/${this.run.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        app_id: this.run.app_id,
                        index_name: this.run.index_name,
                        hits_per_page: this.run.hits_per_page,
                        params: '{}',
                    }),
                });
            },
            deleteRun: async function () {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/runs/${this.run.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$delete(this.suite.runs, this.runPosition);
            }
        }
    }
</script>