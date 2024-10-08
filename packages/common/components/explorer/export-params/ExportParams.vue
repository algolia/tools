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
                    :class="`mt-8 mb-12 mr-8 ${language === currentLanguage ? 'underline': ''}`"
                    @click="currentLanguage = language"
            >
                {{language}}
            </div>
        </div>
        <div>
            <!-- XSS Check: Snippets are generated with Prism -->
            <pre class="text-mono text-sm leading-tight" v-html="snippet"></pre>
        </div>
    </div>
</template>

<script>
    import SnippetGenerator from './snippet-generator';
    import {getClient} from "common/utils/algoliaHelpers";

    export default {
        name: 'ExportParams',
        props: ['appId', 'apiKey', 'indexName', 'query', 'searchParams', 'indexSettings'],
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
            const client = await getClient(this.appId, this.apiKey);
            const keys = await client.listApiKeys();

            let foundKey = false;
            keys.keys.forEach((key) => {
                if (key.description === 'Search-only API Key') {
                    this.searchApiKey = key.value;
                    foundKey = true;
                }
            });

            if (!foundKey) this.searchApiKey = this.apiKey;
        },
        computed: {
            snippet: function () {
                return this.snippetGenerator.snippet({
                    appId: this.appId,
                    apiKey: this.snippetMethod === 'search' ? this.searchApiKey : this.apiKey,
                    indexName: this.indexName,
                    query: this.query,
                    params: this.snippetMethod === 'search' ? this.searchParams : this.indexSettings,
                    language: this.currentLanguage,
                    method: this.snippetMethod,
                })
            }
        },
    }
</script>
