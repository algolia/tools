<template>
    <div class="flex">
        <div :class="{'w-30p': currentTest}">
            <table class="w-full">
                <tr>
                    <td></td>
                    <td v-for="(run, i) in runs" class="bg-proton-grey-opacity-80">
                        <edit-run :suite="suite" :run="run" :run-position="i" />
                    </td>
                    <td class="h-1" v-if="currentTest === null">
                        <div
                            class="ml-16 px-40 border border-dashed border-proton-grey flex items-center justify-center h-full cursor-pointer"
                            @click="addRun"
                        >
                            <div>
                                Add a run
                            </div>
                        </div>
                    </td>
                </tr>
                <group
                    v-for="(group, groupPos) in suite.groups"
                    :key="group.id"
                    :group="group"
                    :group-pos="groupPos"
                    :runs="runs"
                    :suite="suite"
                    :current-test="currentTest"
                    @onTestSelected="currentTest = $event"
                />
            </table>
            <div>
                <button
                    class="mt-8 mb-32 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                    @click="addGroup"
                >
                    Add Group
                </button>
            </div>
            <group-generator-from-csv :suite="suite" />
        </div>
        <div class="w-70p" v-if="currentTest">
            <div class="ml-16 bg-white mb-12 p-8 rounded">
                <hits-config />
            </div>
            <div class="rounded bg-white ml-16 border border-solid border-proton-grey-opacity-60">
                <div class="flex">
                    <div class="min-w-third max-w-third border-r border-proton-grey ">
                        <test-edition
                            :test="currentTest"
                            :current-run="suite.runs[0]"
                            :current-run-index="0"
                            :suite="suite"
                        />
                    </div>
                    <test-preview
                        :current-test="currentTest"
                        :current-run="suite.runs[0]"
                        class="min-w-two-third max-w-two-third bg-white p-8"
                    />
                </div>
            </div>
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
    import {GroupTest, Test} from '@/test-engine/engine';

    import TestEdition from "@/relevance-testing/suite/TestEdition";
    import TestPreview from "@/relevance-testing/suite/TestPreview";
    import EditRun from "@/relevance-testing/suite/EditRun";

    import HitsConfig from "common/components/configuration/HitsConfig";
    import GroupGeneratorFromCsv from "@/relevance-testing/generation/GroupGeneratorFromCsv";
    import Group from "@/relevance-testing/suite/Group";

    export default {
        name: 'Run',
        props: ['suite'],
        components: {Group, GroupGeneratorFromCsv, EditRun, TestPreview, TestEdition, HitsConfig},
        data: function () {
            return {
                hitsPerPage: 8,
                currentTest: null,
            }
        },
        created: function () {
            this.suite.run();
        },
        computed: {
            runs: function () {
                if (this.currentTest === null) {
                    return this.suite.runs;
                }
                if (this.suite.runs.length > 0){
                    return [this.suite.runs[0]];
                }
                return [];
            }
        },
        methods: {
            addGroup: async function () {
                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups`, {
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
            addRun: async function () {
                const apps = Object.keys(this.$store.state.apps);
                const appId = apps.length > 0 ? apps[0] : null;

                const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/runs`, {
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
            }
        }
    }
</script>