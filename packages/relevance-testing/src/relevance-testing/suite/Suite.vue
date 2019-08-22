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
        <run :suite="suite" class="p-16" />
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