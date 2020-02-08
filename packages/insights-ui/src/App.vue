<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Insights UI" />
            <div class="max-w-960 mx-auto mt-24">
                TOTO
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";

    export default {
        name: 'Home',
        components: {InternalApp, AppHeader},
    }
</script>
