<template>
  <div class="indexsize">
    <h1>Index Size</h1>
    <form action="" method="post" v-on:submit.prevent>
      <p>
        <span>Cluster: </span>
        <input type="text" v-model="cluster" placeholder="d38-use, d119-eu..." autocomplete="off" required>
      </p>
      <p>
        <span>App ID: </span>
        <input type="text" v-model="appId" placeholder="Like RSBCBF0EG8" autocomplete="off" required>
      </p>
      <p>
        <span>Index: </span>
        <input type="text" v-model="index" placeholder="great-index-name" autocomplete="off" required>
      </p>
      <p>
        <input type="submit" value="Get" v-on:click="$emit('compute', $data)">
      </p>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'Form',
    data: function () {
      return {
        cluster: '',
        appId: '',
        index: '',
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
