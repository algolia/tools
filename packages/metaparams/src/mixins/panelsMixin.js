export default {
    computed: {
        analyseMaxNbPoints: {
            get () {
                return this.$store.state.panels.analyseMaxNbPoints;
            },
            set (value) {
                this.$store.commit(`panels/setAnalyseMaxNbPoints`, value);
            }
        },
        panelServer: {
            get () {
                return this.$store.state.panels[this.panelKey].server;
            },
            set (value) {
                this.$store.commit(`panels/${this.panelKey}/setServer`, value);
            }
        },
        panelAlgoliaResponse: {
            get () {
                return this.$store.state.panels[this.panelKey].algoliaResponse;
            },
            set (value) {
                this.$store.commit(`panels/${this.panelKey}/setAlgoliaResponse`, value);
            }
        },
        panelCurrentTab: {
            get () {
                return this.$store.state.panels[this.panelKey].currentTab || 'hits';
            },
            set (value) {
                this.$store.commit(`panels/${this.panelKey}/setCurrentTab`, value);
            }
        },
        isLeftPanel: function () {
            return this.panelKey === 'leftPanel';
        },
        searchConfigKey: function () {
            if (!this.isLeftPanel && this.sameIndexOnEachPanel) return 'searchParams2';
            return 'searchParams';
        },
        sameIndexOnEachPanel: function () {
            return this.$store.state.panels.leftPanel.appId === this.$store.state.panels.rightPanel.appId
                && this.$store.state.panels.leftPanel.indexName === this.$store.state.panels.rightPanel.indexName;
        },
    }
}