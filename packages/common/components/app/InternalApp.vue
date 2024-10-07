<template>
    <div id="app" class="bg-moon-grey text-base font-sans-alt min-h-screen">
        <algolia-proxy :enabled="isProduction">
            <slot slot="loggedIn" />
            <div slot="loggedOut" class="h-screen flex justify-center items-center">
                <div class="flex flex-col justify-center items-center">
                    <loader-icon class="w-48 h-48 infinte-rotate" />
                    <div class="mt-20">
                        Connecting to your Algolia account
                    </div>
                </div>
            </div>
            <div slot="unauthorized">
                This an internal algolia app.
            </div>
        </algolia-proxy>
    </div>

</template>

<script>
    import LoaderIcon from "common/icons/loader.svg";
    import AlgoliaProxy from "common/components/app/AlgoliaProxy.vue";

    const isProduction = process.env.NODE_ENV === 'production' && process.env.VUE_APP_PROXY_ENABLED === 'true';

    export default {
        name: 'InternalApp',
        components: {AlgoliaProxy, LoaderIcon},
        data: function () {
            return {isProduction};
        }
    }
</script>
