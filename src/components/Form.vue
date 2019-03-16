<template>
  <div class="indexsize">
    <h1>Index Size</h1>
    <form v-on:submit.prevent>
      <p>
        <label for="cluster">Cluster: </label>
        <input type="text" id="cluster" v-model="cluster" placeholder="d38-use, d119-eu..." autocomplete="off" required>
      </p>
      <p>
        <label for="appId">App ID: </label>
        <input type="text" id="appId" v-model="appId" placeholder="Like RSBCBF0EG8" autocomplete="off" required>
      </p>
      <p>
        <label for="index">Index: </label>
        <input type="text" id="index" v-model="index" placeholder="great-index-name" autocomplete="off" required>
      </p>
      <p v-if="showForceRecompute">
        <input type="checkbox" id="forceRecompute" v-model="forceRecompute">
        <label for="forceRecompute">Force recompute</label>
      </p>
      <p>
        <input type="submit" value="Get" v-on:click="() => { $emit('get', $data); $data.forceRecompute = false; }">
      </p>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'Form',
    props: {
      showForceRecompute: Boolean
    },
    data: function () {
      return {
        cluster: '',
        appId: '',
        index: '',
        forceRecompute: false,
      }
    },
    methods: {
      getState() {
        return {
          cluster: this.cluster,
          appId: this.appId,
          index: this.index,
        }
      }
    }
  }
</script>

<style scoped>

</style>
