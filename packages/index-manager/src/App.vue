<template>
    <div id="app" class="bg-moon-grey text-base font-sans-alt">
        <algolia-proxy :enabled="isProduction || true">
            <index-manager slot="loggedIn" />
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
    import IndexManager from "@/index-manager/IndexManager";
    import LoaderIcon from "common/icons/loader.svg";
    import AlgoliaProxy from "common/components/AlgoliaProxy";

    const isProduction = process.env.NODE_ENV === 'production';

    export default {
        name: 'App',
        components: {AlgoliaProxy, IndexManager, LoaderIcon},
        data: function () {
            return {isProduction};
        }
    }
</script>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Hind:400,600");
    @import "./src/assets/css/main";
</style>