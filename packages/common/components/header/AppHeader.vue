<template>
  <div>
    <div
      class="flex flex-col justify-center w-full bg-white z-10 border-b border-solid border-proton-grey-opacity-80"
      style="min-height: 94px; "
    >
      <div class="flex px-16">
        <div class="flex w-full">
          <div class="flex items-center text-telluric-blue mr-16 text-lg">
            <algolia-logo-experimental class="w-20 h-20 mr-8" />
            <div class="mr-4 mt-2">
              <a :href="`${hostUrl}/apps`">Tools</a>
            </div>
            <chevron-left
              v-if="appName"
              class="w-12 h-12 rotate-180 mr-4"
            />
            <div
              v-if="appName"
              class="mt-2 font-bold"
            >
              {{ appName }}
            </div>
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
        components: {AlgoliaLogoExperimental, ChevronLeft},
        props: {
            appName: {
                type: String,
                required: false,
                default: ''
            }
        },
        computed: {
            hostUrl: function () {
                if (process.env.NODE_ENV === "production" && process.env.VUE_APP_TOOLS_INTERNAL_ENDPOINT && window.currentUserEmail && window.currentUserEmail.endsWith('@algolia.com')) {
                    return process.env.VUE_APP_TOOLS_INTERNAL_ENDPOINT;
                }
                return '';
            }
        },
        mounted() {
            this.storeData();
        },
        methods: {
            storeData() {
                window.globalData = {
                    ...window.globalData,
                    appName: this.appName
                };
            },
        },
    }
</script>
