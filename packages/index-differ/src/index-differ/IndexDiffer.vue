<template>
    <div>
        <app-header app-name="Index Differ">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
    </div>
</template>

<script>
    import AppHeader from "common/components/header/AppHeader";
    import DisplayConfig from "@/index-differ/DisplayConfig";
    import AppManagement from "common/components/configuration/AppManagement";

    export default {
        name: 'IndexDiffer',
        components: {DisplayConfig, AppHeader, AppManagement},
    }
</script>