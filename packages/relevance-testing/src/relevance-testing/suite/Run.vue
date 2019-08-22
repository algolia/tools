<template>
    <div class="w-full">
        <table>
            <tr>
                <td></td>
                <td v-for="(run, i) in suite.runs" class="bg-proton-grey-opacity-80">
                    <div class="p-8 h-120">
                        <div class="text-telluric-blue text-xs flex items-center">
                            <div>
                                <app-selector v-model="run.app_id" />
                                <index-selector v-model="run.index_name" :app-id="run.app_id" />
                                <div v-if="suite.reports[i]" class="flex">
                                    <!--<badge class="mr-16" :passing="suite.reports[i].passing" />-->
                                    <div>{{suite.reports[i].nbPassing}} / {{suite.reports[i].nbTests}}</div>
                                </div>
                                <div @click="suite.runRun(run, i)">Run</div>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="h-1">
                    <div class="ml-16 px-40 border border-dashed border-proton-grey flex items-center justify-center h-full">
                        <div>
                            Add a run
                        </div>
                    </div>
                </td>
            </tr>
            <template v-for="(group, groupPos) in suite.groups">
                <tr class="bg-proton-grey-opacity-40">
                    <td>
                        <div class="flex p-8 text-telluric-blue text-xs uppercase tracking-wide">
                            <div class="mr-16">{{group.name}}</div>
                            <div
                                @click="group.run()"
                                class="ml-auto"
                            >
                                Run
                            </div>
                            <div @click="deleteGroup(group, groupPos)">
                                <trash-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                            </div>
                        </div>
                    </td>
                    <td v-for="(run, i) in suite.runs">
                        <div v-if="group.reports[i]" class="p-8 text-telluric-blue text-xs text-center">
                            <!--<badge class="mr-16" :passing="group.reports[i].passing" />-->
                            {{group.reports[i].nbPassing}} / {{group.reports[i].nbTests}}
                        </div>
                    </td>
                </tr>
                <tr v-for="test in group.tests" class="bg-white">
                    <td>
                        <div class="flex p-8" @click="currentTest = test">
                            <div class="mr-16">{{test.testData.name}}</div>
                            <div
                                class="ml-auto"
                                @click="test.run()"
                            >
                                Run
                            </div>
                        </div>
                    </td>
                    <td v-for="(run, i) in suite.runs">
                        <div class="flex items-center justify-center p-8" @click="currentTest = test">
                            <badge :passing ="test.reports[i] ? test.reports[i].passing : null" />
                        </div>
                    </td>
                </tr>
                <tr class="bg-moon-grey">
                    <td>
                        <button class="mt-8 mb-32 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
                            Add test
                        </button>
                    </td>
                </tr>
            </template>
        </table>
        <div>
            <button
                class="mt-8 mb-32 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                @click="addGroup"
            >
                Add Group
            </button>
        </div>
    </div>
</template>

<style>
    td {
        padding: 0;
    }
</style>

<script>
    import AppSelector from 'common/components/selectors/AppSelector';
    import IndexSelector from 'common/components/selectors/IndexSelector';
    import Badge from '@/relevance-testing/common/Badge';
    import {GroupTest} from '@/test-engine/engine';

    import TrashIcon from 'common/icons/trash.svg';

    export default {
        name: 'Run',
        props: ['suite'],
        components: {Badge, AppSelector, IndexSelector, TrashIcon},
        data: function () {
            return {
                hitsPerPage: 8,
            }
        },
        created: function () {
            this.suite.run();
        },
        methods: {
            getAPIKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
            addGroup: async function () {
                const res = await fetch(`https://metaparams-backend.build/relevance-testing/suites/${this.suite.id}/group`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: `Group ${this.suite.groups.length + 1}`,
                    }),
                });

                const group = await res.json();
                this.suite.groups.push(new GroupTest(group, this.suite.runs, this.suite));
            },
            deleteGroup: async function (group, i) {
                await fetch(`https://metaparams-backend.build/relevance-testing/suites/${this.suite.id}/group/${group.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$delete(this.suite.groups, i);
            },
        }
    }
</script>