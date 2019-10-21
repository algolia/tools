export default {
    methods: {
        ownedByAlgolia(appId) {
            const app = this.$store.state.apps[appId];
            return appId === 'MySuperApp' ||
                appId.endsWith('.local') ||
                appId.endsWith('.test') ||
                (app && app.__app_owner && app.__app_owner.length > 0 && app.__app_owner.endsWith('@algolia.com'));
        },
    }
}
