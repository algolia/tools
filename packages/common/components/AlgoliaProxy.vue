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
        created: async function () {
            if (!this.enabled) return;

            const res = await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/user/info?redirect_to=${window.location.href}`, {
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
        },
    }
</script>