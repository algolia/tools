<template>
    <div id="app" class="bg-moon-grey text-base font-sans-alt min-h-screen">
        <algolia-proxy :enabled="isProduction || true">
            <app-logged-in slot="loggedIn" />
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
    import AppLoggedIn from "@/AppLoggedIn";
    import LoaderIcon from "common/icons/loader.svg";
    import AlgoliaProxy from "common/components/AlgoliaProxy";

    const isProduction = process.env.NODE_ENV === 'production';

    export default {
        name: 'App',
        components: {AlgoliaProxy, AppLoggedIn, LoaderIcon},
        data: function () {
            return {isProduction};
        }
    }
</script>