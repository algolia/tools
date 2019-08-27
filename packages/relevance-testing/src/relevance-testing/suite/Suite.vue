<template>
    <div v-if="suite">
        <div class="flex">
            <div>
                <table class="w-full">
                    <tr>
                        <td class="w-500">
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
                                <td class="bg-proton-grey-opacity-80">
                                    <edit-run :suite="suite" :run="run" :run-position="i" />
                                </td>
                            </template>
                            <td class="h-1">
                                <add-run :suite="suite" />
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
                            <div class="p-8 overflow-y-scroll h-full">
                                <div class="flex">
                                    <div>
                                        Run selector
                                    </div>
                                    <hits-config class="ml-auto" />
                                </div>
                                <test-preview
                                    :current-test="currentTest"
                                    :current-run="suite.runs[0]"
                                />
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

    import PlusIcon from 'common/icons/plus-circle.svg';
    import StatusRun from "@/relevance-testing/run/StatusRun";
    import SlidingPanel from "@/relevance-testing/SlidingPanel";

    export default {
        name: 'RelevanceTesting',
        props: ['suiteId'],
        components: {
            SlidingPanel,
            StatusRun,
            AddRun, TestPreview, TestEdition, Group, GroupGeneratorFromCsv, EditRun, HitsConfig, PlusIcon},
        data: function () {
            return {
                suite: null,
                currentTest: null,
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

                suiteData.runs.forEach((r) => {
                    if (this.$store.state.apps[r.app_id]) {
                        r.api_key = this.$store.state.apps[r.app_id].key;
                    }
                });
                this.suite = new TestSuite(suiteData);
                this.suite.run();
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
        }
    }
</script>