<template>
    <internal-app>
        <div class="min-h-screen pb-24">
            <app-header app-name="Relevance Testing" class="fixed left-0 top-0 w-full z-20">
                <display-config class="mt-0 ml-auto" />
            </app-header>
            <div class="pt-112">
                <app-management />
                <router-view />
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/relevance-testing/common/DisplayConfig";

    export default {
        name: 'RelevanceTesting',
        components: {InternalApp, DisplayConfig, AppHeader, AppManagement},
    }
</script>
