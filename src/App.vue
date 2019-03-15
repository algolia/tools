<template>
  <div id="app">
    <div class="left">
      <span class="logo">
        <img alt="Algolia logo" src="./assets/Logo-algolia-nebula-blue@2x.png">
      </span>
      <Form v-on:compute="getIndexSize({ ...$event })" />
    </div>
    <div class="right">
      <pre>{{ output }}</pre>
    </div>
  </div>
</template>

<script>
import Form from './components/Form.vue'

const baseUrl = 'https://secret-fjord-79801.herokuapp.com'
const computeUrl = baseUrl + '/compute'
const getUrl = baseUrl + '/get-index-size'

export default {
  name: 'app',
  data: function () {
    return {
      output: '⏳ Waiting for compute request',
      requested: false,
    }
  },
  methods: {
    getIndexSize(formData) {
      if (!this.requested) {
        this.output = '🚀 Requesting index size'
        this.requested = true
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
            setTimeout(() => {
              this.getIndexSize(formData)
            }, 10000)
          }
          else if (res.message && res.message === 'Size computing is on-going. Please try again later') {
            this.output = '🔄 Computing the index size - be patient'
            setTimeout(() => {
              this.getIndexSize(formData)
            }, 5000)
          }
          else {
            this.output = JSON.stringify(res, null, 2)
            this.requested = false
          }
        })
        .catch(e => window.console.warn(e))
    },
    async computeIndexSize(formData) {
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
            this.output = '🔄 Computing the index size - be patient'
          }
        })
        .catch(e => window.console.warn(e))
    }
  },
  components: {
    Form
  }
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
</style>
