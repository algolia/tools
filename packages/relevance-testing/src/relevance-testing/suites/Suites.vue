<template>
    <div class="flex">
        <div class="w-full p-16 pt-0 max-w-800">
            <h2 class="text-telluric-blue">Test Suites</h2>
            <div class="flex mt-24 px-8" v-if="persoSuites.length > 0">
                <div class="w-third">Name</div>
                <div class="w-third">Collaborators</div>
                <div class="w-third text-right">Actions</div>
            </div>
            <small-suite v-for="suite in persoSuites" :key="suite.id" :suite="suite" @shouldUpdate="fetchSuites"/>
            <div v-if="persoSuites.length === 0" class="mt-8"> No test suites</div>
            <button
                @click="createSuite"
                class="mt-12 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group">
                Create Suite
            </button>
            <div v-if="sharedSuites.length > 0">
                <h2 class="mt-48 mb-24 text-telluric-blue">Test Suites shared with you</h2>
                <small-suite v-for="suite in sharedSuites" :key="`shared-${suite.id}`" :suite="suite" :read-only="true" @shouldUpdate="fetchSuites"/>
            </div>
        </div>
    </div>
</template>

<script>
    import SmallSuite from "@/relevance-testing/suites/SmallSuite";
    export default {
        name: 'Suites',
        components: {SmallSuite},
        data: function () {
            return {
                persoSuites: [],
                sharedSuites: [],
            }
        },
        created: async function () {
            this.fetchSuites();
        },
        methods: {
            fetchSuites: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://algolia-apps-backend.herokuapp.com';
                const res = await fetch(`${endpoint}/relevance-testing/suites`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const json = await res.json();

                this.persoSuites = json.persoSuites;
                this.sharedSuites = json.sharedSuites;
            },
            createSuite: function () {
                this.persoSuites.push({
                    id: (new Date().getTime())
                });
            }
        }
    }
</script>
