<template>
    <div>
        <div class="flex flex-col w-full bg-white flex z-10 border-b border-solid border-proton-grey-opacity-80">
            <div class="flex p-12">
                <div class="flex w-full">
                    <algolia-logo class="h-40 h-40 mr-16"/>
                    <display-config class="mx-16 mt-0"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AlgoliaLogo from "~/icons/logo.svg";

    import DisplayConfig from "@/dashboard/DisplayConfig";

    export default {
        name: 'AppHeader',
        components: {DisplayConfig, AlgoliaLogo},
    }
</script>