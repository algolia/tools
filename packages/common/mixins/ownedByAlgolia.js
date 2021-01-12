export default {
    methods: {
        ownedByAlgolia(appId) {
            return appId === 'MySuperApp' ||
                appId.endsWith('.local') ||
                appId.endsWith('.test') ||
                (this.appOwner(appId).endsWith('@algolia.com'));
        },
        appOwner(appId) {
            const app = this.$store.state.apps[appId];
            if (process.env.VUE_APP_PROXY_ENABLED !== 'true') {
                return 'tricks@algolia.com';
            }
            return app && app.__app_owner && app.__app_owner.length > 0 ? app.__app_owner : 'not_exisiting_owner';
        },
        connectedEmail() {
            if (process.env.VUE_APP_PROXY_ENABLED !== 'true') {
                return 'tricks@algolia.com';
            }
            return this.$store.state.panels.currentUserEmail ? this.$store.state.panels.currentUserEmail : 'not_existing_email';
        },
        isAlgoliaUser() {
            return this.$store.state.panels.currentUserEmail && this.$store.state.panels.currentUserEmail.endsWith('@algolia.com');
        },
        isOwner(appId) {
            return (this.isAlgoliaUser() && this.ownedByAlgolia(appId)) || this.appOwner(appId) === this.connectedEmail();
        }
    }
}
