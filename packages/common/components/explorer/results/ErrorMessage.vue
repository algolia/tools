<template>
    <div class="border border-mars-1 mb-16 p-8 rounded">
        <div>{{errorMessage}}</div>
        <div v-if="errorMessage.includes('Invalid Application-ID or API key')" class="mt-12">
            <div>App Id: {{panelAppId}}</div>
            <div>API Key: <input v-model="panelAdminAPIKey" class="input-custom inline" placeholder="adminAPIKey" /></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ErrorMessage',
        props: ['errorMessage'],
    }
</script>