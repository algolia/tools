<template>
    <div class="w-full">
        <table>
            <tr>
                <td></td>
                <td v-for="(run, i) in testSuite.runs" class="bg-proton-grey-opacity-80">
                    <div class="p-8 h-120">
                        <div class="text-telluric-blue text-xs flex items-center">
                            <div>
                                <app-selector v-model="run.appId" />
                                <index-selector v-model="run.indexName" :app-id="run.appId" />
                                <div v-if="testSuite.reports[i]" class="flex">
                                    <badge class="mr-16" :passing="testSuite.reports[i].passing" />
                                    <div>{{testSuite.reports[i].nbPassing}} / {{testSuite.reports[i].nbTests}}</div>

                                </div>
                                <div @click="testSuite.runRun(run, i)">Run</div>
                            </div>
                        </div>
                    </div>
                </td>
                <td rowspan="0" class="h-1">
                    <div class="ml-16 px-40 border border-dashed border-proton-grey flex items-center justify-center h-full">
                        <div>
                            Add a run
                        </div>
                    </div>
                </td>
            </tr>
            <template v-for="group in testSuite.groups">
                <tr class="bg-proton-grey-opacity-40">
                    <td>
                        <div class="flex p-8 text-telluric-blue text-xs uppercase tracking-wide">
                            {{group.name}}
                        </div>
                    </td>
                    <td v-for="(run, i) in testSuite.runs">
                        <div class="flex p-8 text-telluric-blue text-xs">
                            <div v-if="group.reports[i]" class="flex">
                                <badge class="mr-16" :passing="group.reports[i].passing" />
                                <div>
                                    {{group.reports[i].nbPassing}} / {{group.reports[i].nbTests}}
                                </div>
                            </div>
                            <div class="ml-auto" @click="group.runRun(run, i)">Run</div>
                        </div>
                    </td>
                </tr>
                <tr v-for="test in group.tests" class="bg-white">
                    <td>
                        <div class="flex p-8" @click="currentTest = test">
                            <div>{{test.testData.name}}</div>
                        </div>
                    </td>
                    <td v-for="(run, i) in testSuite.runs">
                        <div class="flex p-8" @click="currentTest = test">
                            <badge class="mr-16" :passing="test.reports[i] ? test.reports[i].passing : null" />
                            <div class="ml-auto" @click.prevent="test.runRun(run, i)">Run</div>
                        </div>
                    </td>
                </tr>
            </template>
        </table>
    </div>
</template>

<style>
    td {
        padding: 0;
    }
</style>

<script>
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import Badge from "@/relevance-testing/common/Badge";

    export default {
        name: 'Run',
        props: ['testSuite'],
        components: {Badge, AppSelector, IndexSelector},
        data: function () {
            return {
                hitsPerPage: 8,
            }
        },
        created: function () {
            this.testSuite.run();
        },
        methods: {
            getAPIKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
        }
    }
</script>