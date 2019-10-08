<template>
    <internal-app>
        <app-header app-name="Index Size">
        </app-header>
        <app-management />
        <div class="max-w-960 mx-auto mt-24">
            <div class="rounded border border-proton-grey-opacity-60 mt-24">
                <div class="flex bg-white p-8 pb-12 bg-proton-grey-opacity-40 text-telluric-blue">
                    <Form
                        v-bind:show-force-recompute="showForceRecompute"
                        v-bind:disable-button="disableButton"
                        v-on:get="getIndexSize({ ...$event })"
                    />
                </div>
                <div class="bg-white text-nova-grey">
                    <p>{{ this.lastDate }}</p>
                    <highlight-code lang="json" v-bind:code="output"></highlight-code>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppManagement from "common/components/configuration/AppManagement";
    import AppHeader from "common/components/header/AppHeader";
    import Form from './components/Form.vue';

    const baseUrl = 'https://index-size.herokuapp.com';
    const computeUrl = baseUrl + '/compute';
    const getUrl = baseUrl + '/get-index-size';
    const computeTimeout = 10000;
    const retryTimeout = 5000;
    const computeMessage = '🔄 Computing the index size – be patient';
    const errorMessage = '⚠️ Error – check params';

    export default {
        name: 'app',
        components: {
            Form,
            InternalApp,
            AppManagement,
            AppHeader,
        },
        data: function () {
            return {
                lastDate: '',
                output: '⏳ Waiting for request',
                requested: false,
                showForceRecompute: false,
                disableButton: false,
            }
        },
        methods: {
            showLastDate(utcDateStr) {
                this.lastDate = utcDateStr ? 'Last computation: ' + new Date(utcDateStr).toLocaleString() : ''
            },
            getIndexSize(formData) {
                if (!this.requested) {
                    this.output = '🚀 Requesting index size'
                    this.requested = true
                    this.disableButton = true
                    this.showLastDate(false)
                }
                if (formData.forceRecompute) {
                    this.computeIndexSize(formData)
                    formData.forceRecompute = false
                    return;
                }
                fetch(getUrl, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.message && res.message === 'No size computation available for this index') {
                            this.computeIndexSize(formData)
                        } else if (res.message && res.message === 'Size computing is on-going. Please try again later') {
                            this.output = computeMessage
                            setTimeout(() => this.getIndexSize(formData), retryTimeout)
                        } else {
                            // here we got the final output, so we:
                            // 1. show it
                            // 2. display a "force recompute" checkbox
                            // 3. show last date to make it explicit
                            this.output = JSON.stringify(res, null, 2)
                            this.requested = false
                            this.showForceRecompute = true
                            this.disableButton = false
                            this.showLastDate(res.generatedAt)
                        }
                    })
                    .catch(e => this.handleError(e))
            },
            computeIndexSize(formData) {
                fetch(computeUrl, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.message && res.message.indexOf('Computing the index size') !== -1) {
                            this.output = computeMessage
                            // Computing has started correctly, start polling to get the results
                            setTimeout(() => this.getIndexSize(formData), computeTimeout)
                        } else {
                            this.output = `⚠️ ${res.message}`
                            this.disableButton = false
                        }
                    })
                    .catch(e => this.handleError(e))
            },
            handleError(e) {
                window.console.warn('Request error', e)
                this.output = errorMessage
                this.disableButton = false
            },
        },
    }
</script>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Hind:400,600");
    @import "./src/assets/css/main";

    code.hljs {
        padding: 1em;
    }
</style>
