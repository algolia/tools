<template>
    <div class="border border-mars-1 mb-16 p-8 rounded">
        <div>{{errorMessage}}</div>
        <div v-if="errorMessage.includes('Invalid Application-ID or API key')" class="mt-12">
            <div>App Id: {{appId}}</div>
            <div>API Key: <input v-model="adminAPIKey" class="input-custom inline" placeholder="adminAPIKey" /></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ErrorMessage',
        props: ['errorMessage', 'appId', 'apiKey'],
        computed: {
            adminAPIKey: {
                get () {
                    return this.apiKey;
                },
                set (val) {
                    this.$emit('onUpdateApiKey', val);
                }
            }
        }
    }
</script>