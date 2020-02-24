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
            }
        },
        created:  function () {
            this.connect();

            window.addEventListener("focus", () => {
                this.connect();
            });
        },
        methods: {
            connect: async function () {
                if (!this.enabled) return;

                const backendEndpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
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

                this.currentUser = json;
            }
        }
    }
</script>
