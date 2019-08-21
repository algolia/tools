<template>
    <div>
        <div class="flex p-16">
            <h2>
                <router-link to="/suites">
                    Suites
                </router-link>
                >
                {{testSuite.name}}
            </h2>
        </div>
        <div class="flex p-16">
            <run :test-suite="testSuite" />
            <!--<div class="w-75p" v-if="currentTest">
                <div class="rounded bg-white ml-16 border border-solid border-proton-grey-opacity-60">
                    <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                        {{currentTest.testData.name}}
                    </div>
                    <div class="flex">
                        <div class="min-w-third max-w-third border-r border-proton-grey ">
                            <test-edition
                                :test="currentTest"
                                :current-run="testSuite.runs[0]"
                                :current-run-index="0"
                                @onUpdatedTestData="currentTest.run(true)"
                            />
                        </div>
                        <test-preview
                            :current-test="currentTest"
                            :current-run="testSuite.runs[0]"
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
    import data from "@/test-engine/data";


    import Run from "@/relevance-testing/suite/Run";
    import TestPreview from "@/relevance-testing/suite/TestPreview";


    export default {
        name: 'RelevanceTesting',
        components: {TestPreview, Run, TestEdition},
        data: function () {
            const testSuite = new TestSuite(data);
            return {
                testSuite: testSuite,
                currentTest: testSuite.groups[0].tests[0],
            };
        },
    }
</script>