<template>
    <div v-if="suite">
        <div class="flex">
            <div>
                <table class="w-full">
                    <tr>
                        <td class="w-500 min-w-500">
                            <div class="px-12">
                                <div class="flex">
                                    <h2 class="text-telluric-blue">
                                        <router-link to="/suites">
                                            Suites
                                        </router-link>
                                        >
                                        {{suite.name}}
                                    </h2>
                                </div>
                                <div class="my-24">
                                    <button
                                        @click="addGroup"
                                        class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                                    >
                                        Create new group
                                    </button>
                                    <button
                                        @click="displayGenerator = true"
                                        class="mt-4 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                                    >
                                        Create new group from CSV
                                    </button>
                                </div>
                            </div>
                        </td>
                        <template>
                            <template v-for="(run, i) in suite.runs">
                                <td class="w-2 bg-moon-grey"></td>
                                <td class="bg-proton-grey-opacity-80 h-1 min-w-232">
                                    <edit-run
                                        :suite="suite"
                                        :run="run"
                                        :run-position="i"
                                        @onDelete="onDeleteRun"
                                    />
                                </td>
                            </template>
                            <td class="h-1">
                                <add-run
                                    :suite="suite"
                                    @onAddRun="onAddRun"
                                />
                            </td>
                        </template>
                    </tr>
                    <tr><td colspan="0" class="h-2 bg-moon-grey"></td></tr>
                    <tr>
                        <td class="bg-proton-grey-opacity-80">
                            <div class="text-telluric-blue text-xs uppercase tracking-wide p-8">
                                All groups
                            </div>
                        </td>
                        <template>
                            <template v-for="(run, runPosition) in suite.runs">
                                <td class="w-2 bg-moon-grey"></td>
                                <td

                                    class="bg-proton-grey-opacity-80"
                                >
                                    <status-run :suite="suite" :run="run" :run-position="runPosition" />
                                </td>
                            </template>
                        </template>
                    </tr>
                    <group
                        v-for="(group, groupPos) in suite.groups"
                        :key="group.id"
                        :group="group"
                        :group-pos="groupPos"
                        :runs="suite.runs"
                        :suite="suite"
                        :current-test="currentTest"
                        @onTestSelected="currentTest = $event"
                    />
                </table>
            </div>
            <sliding-panel
                v-if="displayGenerator"
                @onClosePanel="displayGenerator = null"
            >
                <group-generator-from-csv :suite="suite" />
            </sliding-panel>
            <sliding-panel
                v-if="currentTest"
                @onClosePanel="currentTest = null"
            >
                <div class="h-full">
                    <div class="flex h-full">
                        <div class="min-w-third max-w-third border-r border-proton-grey overflow-y-scroll h-full">
                            <test-edition
                                :test="currentTest"
                                :current-run="suite.runs[0]"
                                :current-run-index="0"
                                :suite="suite"
                            />
                        </div>
                        <div class="h-full min-w-two-third max-w-two-third bg-white">
                            <div class="overflow-y-scroll h-full">
                                <div v-if="currentRun">
                                    <div>
                                        <div class="flex text-nova-grey bg-moon-grey w-full overflow-x-auto">
                                            <div
                                                v-for="(run, i) in suite.runs"
                                                class="px-24 py-8 cursor-pointer"
                                                @click="currentRun = run"
                                                :class="currentRun === run ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                                            >
                                                <div>{{run.app_id}}</div>
                                                <div>{{run.index_name}}</div>
                                                <div>pageSize: {{run.hits_per_page}}</div>
                                                <template v-for="(paramValue, paramName) in run.params">
                                                    <template v-if="paramValue.enabled">
                                                        <div>
                                                            {{paramName}}: {{JSON.stringify(paramValue.value)}}
                                                        </div>
                                                    </template>
                                                </template>
                                            </div>
                                        </div>
                                        <div class="flex">
                                            <hits-config class="mt-12 mb-4 -ml-40" />
                                        </div>
                                    </div>
                                    <test-preview
                                        class="p-8"
                                        :current-test="currentTest"
                                        :current-run="currentRun"
                                    />
                                </div>
                                <div v-else class="p-8">
                                    No Runs configured
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </sliding-panel>
        </div>
    </div>
</template>

<style>
    td {
        padding: 0;
        vertical-align: top;
    }
</style>

<script>
    import {GroupTest, TestSuite} from "@/test-engine/engine";
    import TestEdition from "@/relevance-testing/suite/TestEdition"
    import EditRun from "@/relevance-testing/run/EditRun";

    import HitsConfig from "common/components/configuration/HitsConfig";
    import GroupGeneratorFromCsv from "@/relevance-testing/generation/GroupGeneratorFromCsv";
    import Group from "@/relevance-testing/suite/Group";

    import TestPreview from "@/relevance-testing/suite/TestPreview";
    import AddRun from "@/relevance-testing/run/AddRun";

    import StatusRun from "@/relevance-testing/run/StatusRun";
    import SlidingPanel from "@/relevance-testing/SlidingPanel";

    export default {
        name: 'RelevanceTesting',
        props: ['suiteId'],
        components: {
            SlidingPanel,
            StatusRun,
            AddRun, TestPreview, TestEdition, Group, GroupGeneratorFromCsv, EditRun, HitsConfig},
        data: function () {
            return {
                suite: null,
                currentTest: null,
                currentRun: null,
                displayGenerator: null,
            };
        },
        created: function () {
            this.fetchSuite();
        },
        methods: {
            fetchSuite: async function () {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suiteId}`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const suiteData = await res.json();

                if (suiteData === 404 || suiteData === 403) {
                    this.$router.push('/suites');
                    return;
                }

                this.suite = new TestSuite(suiteData);
                this.suite.run();
                this.currentRun = suiteData.runs.length > 0 ? suiteData.runs[0]: null;
                this.currentTest = this.suite.groups[0].tests[0];
            },
            addGroup: async function () {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: `Group of tests ${this.suite.groups.length + 1}`,
                    }),
                });

                const group = await res.json();
                this.suite.groups.push(new GroupTest(group, this.suite.runs, this.suite));
            },
            onDeleteRun: function (runId) {
                if (this.currentRun.id === runId) {
                    this.currentRun = this.suite.runs.length > 0 ? this.suite.runs[0] : null;
                }
            },
            onAddRun: function () {
                if (this.suite.runs.length === 1) {
                    this.currentRun = this.suite.runs[0];
                }
            }
        }
    }
</script>