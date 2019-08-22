<template>
    <div v-if="suite">
        <div class="flex p-16">
            <h2>
                <router-link to="/suites">
                    Suites
                </router-link>
                >
                {{suite.name}}
            </h2>
        </div>
        <div class="flex p-16">
            <run :suite="suite" />
            <!--<div class="w-75p" v-if="currentTest">
                <div class="rounded bg-white ml-16 border border-solid border-proton-grey-opacity-60">
                    <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                        {{currentTest.testData.name}}
                    </div>
                    <div class="flex">
                        <div class="min-w-third max-w-third border-r border-proton-grey ">
                            <test-edition
                                :test="currentTest"
                                :current-run="suite.runs[0]"
                                :current-run-index="0"
                                @onUpdatedTestData="currentTest.run(true)"
                            />
                        </div>
                        <test-preview
                            :current-test="currentTest"
                            :current-run="suite.runs[0]"
                            class="min-w-two-third max-w-two-third bg-white p-8"
                        />
                    </div>
                </div>
            </div>-->
        </div>
    </div>
</template>

<script>
    import {TestSuite} from "@/test-engine/engine";
    import TestEdition from "@/relevance-testing/suite/TestEdition"


    import Run from "@/relevance-testing/suite/Run";
    import TestPreview from "@/relevance-testing/suite/TestPreview";


    export default {
        name: 'RelevanceTesting',
        props: ['suiteId'],
        components: {TestPreview, Run, TestEdition},
        data: function () {
            return {
                suite: null,
                currentTest: null,
            };
        },
        created: function () {
            this.fetchSuite();
        },
        methods: {
            fetchSuite: async function () {
                const res = await fetch(`https://metaparams-backend.build/relevance-testing/suites/${this.suiteId}`, {
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
                    r.api_key = this.$store.state.apps[r.app_id].key;
                });
                this.suite = new TestSuite(suiteData);
            }
        }
    }
</script>