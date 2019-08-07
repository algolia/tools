<template>
    <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 mt-16 p-8">
        <div>
            <label>
                <input type="radio" v-model="snippetMethod" value="search"/> Search
            </label>
            <label>
                <input type="radio" v-model="snippetMethod" value="setSettings"/> Settings
            </label>
        </div>
        <div class="flex">
            <div
                    v-for="language in languages"
                    :class="`mx-8 ${language === currentLanguage ? 'underline': ''}`"
                    @click="currentLanguage = language"
            >
                {{language}}
            </div>
        </div>
        <div>
            <pre v-html="snippet"></pre>
        </div>
    </div>
</template>

<script>
    import SnippetGenerator from './snippet-generator';
    import indexInfoMixin from "../../../mixins/indexInfoMixin";

    export default {
        name: 'ExportParams',
        props: ['panelKey'],
        mixins: [indexInfoMixin],
        data: function () {
            return {
                searchApiKey: '',
                snippetMethod: 'search',
                snippetGenerator: new SnippetGenerator(),
                currentLanguage: 'php',
                languages: ['php', 'ruby', 'javascript', 'python', 'curl'],
            }
        },
        created: async function () {
            const client = this.algoliasearch(this.panelAppId, this.panelAdminAPIKey);
            const keys = await client.listApiKeys();

            let foundKey = false;
            keys.keys.forEach((key) => {
                if (key.description === 'Search-only API Key') {
                    this.searchApiKey = key.value;
                    foundKey = true;
                }
            });

            if (!foundKey) this.searchApiKey = this.panelAdminAPIKey;
        },
        computed: {
            snippet: function () {
                return this.snippetGenerator.snippet({
                    appId: this.panelAppId,
                    apiKey: this.snippetMethod === 'search' ? this.searchApiKey : this.panelAdminAPIKey,
                    indexName: this.panelIndexName,
                    query: this.$store.state.panels.query,
                    params: this.snippetMethod === 'search' ? this.searchParams : this.indexSettings,
                    language: this.currentLanguage,
                    method: this.snippetMethod,
                })
            }
        },
    }
</script>