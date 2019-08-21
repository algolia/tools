<template>
    <div class="min-h-screen pb-24">
        <app-header app-name="Relevance Testing">
            <display-config class="mx-16 mt-0 ml-auto" />
        </app-header>
        <app-management />
        <router-view />
    </div>
</template>

<script>
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/relevance-testing/common/DisplayConfig";

    export default {
        name: 'RelevanceTesting',
        components: {DisplayConfig, AppHeader, AppManagement},
    }
</script>