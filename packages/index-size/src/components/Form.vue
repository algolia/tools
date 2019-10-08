<template>
    <div class="indexsize">
        <form @submit.prevent>
            <div class="flex">
                <p>
                    <label for="cluster">Cluster: </label>
                    <input type="text" id="cluster" v-model="cluster" placeholder="d38-use-1, d119-eu, ..."
                           autocomplete="off" required>
                </p>
                <p>
                    <label for="appId">App ID: </label>
                    <input type="text" id="appId" v-model="appId" placeholder="e.g. RSBCBF0EG8" autocomplete="off" required>
                </p>
                <p>
                    <label for="index">Index: </label>
                    <input type="text" id="index" v-model="index" placeholder="index_name" autocomplete="off" required>
                </p>
                <p v-if="showForceRecompute">
                    <input type="checkbox" id="forceRecompute" v-model="forceRecompute">
                    <label for="forceRecompute">Force recompute</label>
                </p>
                <p>
                    <input type="submit" value="Get" :disabled="disableButton"
                           @click="() => {
                         $emit('get', $data);
                         $data.forceRecompute = false;
                         $data.disableButton = true;
                       }"
                    >
                </p>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        name: 'Form',
        props: {
            showForceRecompute: Boolean,
            disableButton: Boolean,
        },
        data: function () {
            return {
                cluster: '',
                appId: '',
                index: '',
                forceRecompute: false,
            }
        },
    }
</script>
