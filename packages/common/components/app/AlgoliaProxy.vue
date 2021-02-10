<template>
    <div>
        <slot name="loggedIn" v-if="authorized && (!enabled || currentUser)" />
        <slot name="loggedOut" v-else-if="authorized" />
        <slot name="unauthorized" v-else />
    </div>
</template>

<script>
    export default {
        name: 'AlgoliaProxy',
        props: ['enabled'],
        data: function () {
            return {
                currentUser: null,
                authorized: true,
                paused: false,
            }
        },
        created:  function () {
            this.connect();

            this.$root.$on('onShouldPauseProxy', () => {
                this.paused = true;
            });

            this.$root.$on('onShouldResumeProxy', () => {
                this.paused = true;
            });

            window.addEventListener("focus", () => {
                if (!this.paused) {
                    this.connect();
                }
            });
        },
        methods: {
            connect: async function () {
                if (!this.enabled) return;

                const backendEndpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT;
                const res = await fetch(`${backendEndpoint}/user/info?redirect_to=${window.location.href}`, {
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const json = await res.json();

                if (json.error && json.error === 'not_authorized') {
                    this.authorized = false;
                }

                if (json.redirect_url) {
                    window.location.href = json.redirect_url;
                    return;
                }

                if (window.location.pathname.startsWith('/apps') && process.env.NODE_ENV === "production" && process.env.VUE_APP_TOOLS_INTERNAL_ENDPOINT && json.user.email.endsWith('@algolia.com')) {
                    window.location.href = `${process.env.VUE_APP_TOOLS_INTERNAL_ENDPOINT}${window.location.pathname}`;
                }

                window.currentUserEmail = json.user.email;
                window.signature = json.signature;
                window.imageProxy = json.imageProxy;

                this.$store.commit('panels/setCurrentUserEmail', json.user.email);

                this.currentUser = json;
            }
        }
    }
</script>
