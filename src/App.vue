<template>
  <div id="app">
    <div class="left">
      <span class="logo">
        <img alt="Algolia logo" src="./assets/Logo-algolia-nebula-blue@2x.png">
      </span>
      <Form
        v-bind:show-force-recompute="showForceRecompute"
        v-bind:disable-button="disableButton"
        v-on:get="getIndexSize({ ...$event })"
      />
    </div>
    <div class="right">
      <p>{{ this.lastDate }}</p>
      <highlight-code lang="json" v-bind:code="output"></highlight-code>
    </div>
  </div>
</template>

<script>
import Form from './components/Form.vue'

const baseUrl = 'https://index-size.herokuapp.com'
const computeUrl = baseUrl + '/compute'
const getUrl = baseUrl + '/get-index-size'
const computeTimeout = 10000
const retryTimeout = 5000
const computeMessage = '🔄 Computing the index size – be patient'
const errorMessage = '⚠️ Error – check params'

export default {
  name: 'app',
  components: {
    Form
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
          }
          else if (res.message && res.message === 'Size computing is on-going. Please try again later') {
            this.output = computeMessage
            setTimeout(() => this.getIndexSize(formData), retryTimeout)
          }
          else {
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
          }
          else {
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

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 20px;
  display: flex;
}
.logo img {
  width: 200px;
}
.left {
  padding-right: 50px;
}
.right {
  padding-left: 50px;
  border-left: 1px solid #2c3e50;
}
code.hljs {
  padding: 1em;
}
</style>
