<template>
    <div id="app" class="bg-moon-grey text-base font-sans-alt min-h-screen">
        <algolia-proxy :enabled="isProduction" v-slot="{ authorized, currentUser, enabled }">
            <!-- Conditionally render content based on the passed state -->
            <div v-if="authorized && (!enabled || currentUser)">
                <slot></slot>
            </div>

            <div v-else-if="authorized">
                <!-- Content for Logged Out -->
                <div class="h-screen flex justify-center items-center">
                    <div class="flex flex-col justify-center items-center">
                        <loader-icon class="w-48 h-48 infinite-rotate" />
                        <div class="mt-20">
                            Connecting to your Algolia account
                        </div>
                    </div>
                </div>
            </div>

            <div v-else>
                <!-- Content for Unauthorized -->
                <p>This is an internal Algolia app.</p>
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
    components: { AlgoliaProxy, LoaderIcon },
    data() {
        return { isProduction };
    }
}
</script>
