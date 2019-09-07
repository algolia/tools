<template>
    <div class="p-8 h-full text-telluric-blue text-sm">
        <div class="flex flex-col h-full">
            <app-selector v-model="run.app_id" />
            <index-selector v-model="run.index_name" :app-id="run.app_id" />
            <div class="flex my-12">
                <div>Page size:</div>
                <input v-model="run.hits_per_page" type="number" min="1" max="1000" class="input-custom ml-8" />
            </div>
            <params
                class="mt-auto mb-24"
                :id="`run-${run.id}`"
                config-key="searchParams"
                :params="run.params"
                :ref-params="run.params"
                :raw-params="run.params"
                :keys="Object.keys(run.params)"
                :keys-indexer="null"
                :mutate="true"
                panel-key="leftPanel"
            />
            <div class="flex items-center">
                <div
                    @click="suite.runRun(run, runPosition)"
                    class="text-xs uppercase tracking-wide"
                >
                    Run
                </div>
                <div class="ml-auto">
                    <trash-icon
                        v-if="!confirmDelete"
                        @click="confirmDelete = true"
                        class="w-12 h-12 block cursor-pointer text-solstice-blue"
                    />
                    <div v-if="confirmDelete" class="flex">
                        <button
                            @click="deleteRun"
                            class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8"
                        >
                            Delete
                        </button>
                        <button
                            @click="confirmDelete = false"
                            class="ml-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';
    import Params from 'common/components/params/Params';

    import TrashIcon from 'common/icons/trash.svg';

    export default {
        name: 'EditRun',
        props: ['suite', 'run', 'runPosition'],
        components: {AppSelector, IndexSelector, TrashIcon, Params},
        data: function () {
            return {
                confirmDelete: false,
            }
        },
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
                        params: JSON.stringify(this.run.params),
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