<template>
    <div>
        <div class="flex flex-col justify-center w-full bg-white z-10 border-b border-solid border-proton-grey-opacity-80" style="height: 94px; ">
            <div class="flex px-16 py-12">
                <div class="flex w-full">
                    <div class="flex items-center text-telluric-blue mr-16 text-lg">
                        <algolia-logo-experimental class="w-20 h-20 mr-8"/>
                        <div class="mr-4 mt-2"><a href="/apps">Tools</a></div>
                        <chevron-left v-if="appName" class="w-12 h-12 rotate-180 mr-4" />
                        <div v-if="appName" class="mt-2 font-bold">{{appName}}</div>
                    </div>
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AlgoliaLogoExperimental from "../../icons/logo-experimental.svg";
    import ChevronLeft from "../../icons/chevron-left.svg";

    export default {
        name: 'AppHeader',
        props: ['appName'],
        components: {AlgoliaLogoExperimental, ChevronLeft},
    }
</script>
