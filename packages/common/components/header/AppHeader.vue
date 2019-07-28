<template>
    <div>
        <div class="flex flex-col w-full bg-white flex z-10 border-b border-solid border-proton-grey-opacity-80">
            <div class="flex px-16 py-12">
                <div class="flex w-full">
                    <div class="flex items-center text-telluric-blue mr-16 text-lg">
                        <algolia-logo class="h-20 h-20 mr-8"/>
                        <div class="mr-4 mt-2">Apps</div>
                        <chevron-left class="w-12 h-12 rotate-180 mr-4" />
                        <div class="mt-2 font-bold">{{appName}}</div>
                    </div>
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AlgoliaLogo from "../../icons/logo.svg";
    import ChevronLeft from "../../icons/chevron-left.svg";

    export default {
        name: 'AppHeader',
        props: ['appName'],
        components: {AlgoliaLogo, ChevronLeft},
    }
</script>