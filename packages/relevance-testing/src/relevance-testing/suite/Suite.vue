<template>
    <div v-if="suite">
        <div class="flex">
            <div>
                <table class="w-full">
                    <tr class="h-full">
                        <td class="w-500 min-w-500">
                            <div class="px-12">
                                <h2 class="text-telluric-blue">
                                    <router-link to="/suites" class="hover:underline">
                                        Tests Suites
                                    </router-link>
                                    >
                                    {{suite.name}}
                                </h2>
                                <div class="mt-24 flex items-center">
                                    <div>
                                        Display tests:
                                    </div>
                                    <custom-select
                                        v-model="filtering"
                                        :options="Object.keys(filteringOptions)"
                                        class="ml-12 mr-16 w-176 text-solstice-blue text-sm border-b border-telluric-blue-opacity-60"
                                    >
                                        <template v-slot:default="{option}">{{filteringOptions[option]}}</template>
                                    </custom-select>
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
                            <div class="flex p-8">
                                <div class="text-telluric-blue text-xs uppercase tracking-wide">
                                    All groups
                                </div>
                                <div class="ml-auto ml-8 flex">
                                    <div @click.stop="addGroup" class="relative group">
                                        <plus-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                                        <tooltip>Create group of tests</tooltip>
                                    </div>
                                    <div @click.stop="displayGenerator = true" class="relative group">
                                        <upload-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                                        <tooltip>Create group of tests from CSV</tooltip>
                                    </div>
                                </div>
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
                        :force-open="currentTest && group.id === currentTest.group.id"
                        :key="group.id"
                        :group="group"
                        :group-pos="groupPos"
                        :runs="suite.runs"
                        :suite="suite"
                        :current-test="currentTest"
                        :filtering="filtering"
                        @onTestSelected="setCurrentTest"
                        @onRunSelected="setCurrentRun"
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
                @onClosePanel="setCurrentTest(null)"
            >
                <div class="h-full">
                    <div class="flex text-nova-grey bg-moon-grey w-full overflow-x-auto">
                        <div
                            v-for="(run, i) in suite.runs"
                            class="px-24 py-8 cursor-pointer"
                            @click="setCurrentRun(run)"
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
                    <div class="flex h-full pb-96">
                        <div class="min-w-third max-w-third border-r border-proton-grey overflow-y-scroll h-full">
                            <test-edition
                                :test="currentTest"
                                :current-run="currentRun"
                                :current-run-index="suite.runs.findIndex((run) => run === currentRun)"
                                :suite="suite"
                            />
                        </div>
                        <div class="h-full min-w-two-third max-w-two-third bg-white">
                            <div class="overflow-y-scroll h-full pb-96">
                                <div class="flex h-full">
                                    <div class="flex-grow max-w-full" :style="$store.state.panels.comparePanels ? 'max-width: calc(100% - 240px)' : ''">
                                        <div v-if="currentRun">
                                            <div class="flex">
                                                <hits-config class="mt-12 mb-4 -ml-40" />
                                                <panels-config class="mt-12 mb-4 ml-auto" :hide-split="true" />
                                            </div>
                                            <test-preview
                                                class="p-8"
                                                :current-test="currentTest"
                                                :current-run="currentRun"
                                                :page="page"
                                                @onUpdatePage="page = $event"
                                            />
                                        </div>
                                        <div v-else class="p-8">
                                            No Runs configured
                                        </div>
                                    </div>
                                    <div v-show="$store.state.panels.comparePanels" class="w-240 flex-1">
                                        <compare-hits
                                            class="pb-8 pl-8 pr-32"
                                            :enabled="$store.state.panels.comparePanels"
                                            :forced-tracked="forcedTracked"
                                            @onGoToHit="onGoToHit"
                                        />
                                    </div>
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
    import CompareHits from "common/components/compare/CompareHits";
    import CustomSelect from "common/components/selectors/CustomSelect";

    import HitsConfig from "common/components/configuration/HitsConfig";
    import PanelsConfig from "common/components/configuration/PanelsConfig";
    import GroupGeneratorFromCsv from "@/relevance-testing/generation/GroupGeneratorFromCsv";
    import Group from "@/relevance-testing/suite/Group";

    import TestPreview from "@/relevance-testing/suite/TestPreview";
    import AddRun from "@/relevance-testing/run/AddRun";

    import StatusRun from "@/relevance-testing/run/StatusRun";
    import SlidingPanel from "@/relevance-testing/SlidingPanel";

    import Tooltip from "common/components/Tooltip";

    import PlusIcon from 'common/icons/plus-circle.svg';
    import UploadIcon from 'common/icons/upload.svg';
    import {goToAnchor} from "common/utils/domHelpers";

    export default {
        name: 'RelevanceTesting',
        props: ['suiteId', 'testId', 'runId'],
        components: {
            SlidingPanel,
            StatusRun,
            AddRun, TestPreview, TestEdition, Group, GroupGeneratorFromCsv, EditRun, HitsConfig, PanelsConfig, Tooltip, PlusIcon, UploadIcon, CompareHits, CustomSelect},
        data: function () {
            return {
                page: 0,
                suite: null,
                currentTest: null,
                currentRun: null,
                displayGenerator: null,
                filteringOptions: {
                    'all': 'all',
                    'allPassing': 'all passing',
                    'allFailing': 'all failing',
                    'onePassing': '>= 1 passing',
                    'oneFailing': '>= 1 failing',
                    'onePassingOneFailing': '>= 1 passing and >= 1 failing',
                }
            };
        },
        created: function () {
            this.fetchSuite();
        },
        computed: {
            filtering: {
                get () {
                    return this.$store.state.relevancetesting.filtering || 'all';
                },
                set (val) {
                    this.$store.commit('relevancetesting/setFiltering', val);
                }
            },
            forcedTracked: function () {
                const tracked = [];
                this.currentTest.testData.then.forEach((then) => {
                    if (then.recordsMatching) {
                        then.recordsMatching.forEach((requirement) => {
                            if (requirement.type === 'attribute') {
                                tracked.push(`${requirement.key}:${requirement.value}`);
                            }
                            if (requirement.type === 'is before' || requirement.type === 'is after') {
                                requirement.value.forEach((requirement2) => {
                                    if (requirement2.type === 'attribute') {
                                        tracked.push(`${requirement2.key}:${requirement2.value}`);
                                    }
                                });
                            }
                        });
                    }
                });

                return [...new Set(tracked)];
            },
        },
        methods: {
            onGoToHit: function (i) {
                const pageSize = this.currentRun.hits_per_page || this.currentTest.testData.hits_per_page || 1;
                const goToPage = Math.floor((i - 1) / pageSize);
                const anchor = `#leftPanel-${i}`;

                if (this.page !== goToPage) {
                    this.page = goToPage;
                    this.$root.$emit('wantsToGoToAnchorAtNext', anchor);
                } else {
                    this.$nextTick(() => {
                        goToAnchor(anchor);
                    });
                }
            },
            fetchSuite: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://algolia-apps-backend.herokuapp.com';
                const res = await fetch(`${endpoint}/relevance-testing/suites/${this.suiteId}`, {
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

                this.suite = new TestSuite(suiteData, (appId) => {
                    if (this.$store.state.apps[appId]) {
                        return this.$store.state.apps[appId].key;
                    }
                    return '';
                });
                this.suite.run();

                let run = this.suite.runs.length > 0 ? this.suite.runs[0]: null;
                if (this.runId) {
                    this.suite.runs.forEach((r) => {
                        if (r.id === parseInt(this.runId)) run = r;
                    });
                }
                if (this.testId) {
                    this.suite.groups.forEach((g) => {
                        g.tests.forEach((t) => {
                            if (t.id === parseInt(this.testId)) {
                                this.setCurrentTest(t);
                            }
                        });
                    });
                }

                this.setCurrentRun(run);
            },
            addGroup: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://algolia-apps-backend.herokuapp.com';
                const res = await fetch(`${endpoint}/relevance-testing/suites/${this.suite.id}/groups`, {
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
                    const run = this.suite.runs.length > 0 ? this.suite.runs[0] : null;
                    this.setCurrentRun(run);
                }
            },
            onAddRun: function () {
                if (this.suite.runs.length === 1) {
                    this.setCurrentRun(this.suite.runs[0]);
                }
            },
            updateUrl: function () {
                let url = `/suites/${this.suiteId}`;
                if (this.currentTest) url += `/tests/${this.currentTest.id}`;
                if (this.currentRun) url += `/runs/${this.currentRun.id}`;

                this.$router.replace(url);
            },
            setCurrentTest: function (test) {
                this.currentTest = test;
                this.updateUrl();
            },
            setCurrentRun: function (run) {
                this.currentRun = run;
                this.updateUrl();
            }
        }
    }
</script>
