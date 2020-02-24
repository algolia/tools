<template>
    <div class="flex">
        <div class="rounded bg-white m-16 mr-64 border border-solid border-proton-grey-opacity-60 min-w-25p">
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
                <div>Current state sharing link</div>
                <close-icon
                    class="cursor-pointer ml-auto w-12 h-12"
                    @click="$store.commit('panels/setShareStatePanel', false)"
                />
            </div>
            <div>
                <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 m-8 p-8">
                    The link will be valid for 6 months
                </div>
                <div v-if="newLink" class="flex items-center">
                    <div class="p-8">
                        {{newLink}}
                    </div>
                    <div class="p-8">
                        <button @click="copy" class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm">
                            Copy link
                        </button>
                    </div>
                    <div class="p-8" v-if="copied">
                        Copied!
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import CloseIcon from "common/icons/x.svg";

    import stateReducer from "common/store/stateReducer";

    import copy from 'copy-to-clipboard';

    export default {
        name: 'ShareView',
        components: {CloseIcon},
        data: function () {
            return {
                newLink: null,
                copied: false,
            }
        },
        created: function () {
            this.createShortLink();
        },
        watch: {
            exportableData: {
                deep: true,
                handler: function () {
                    this.$emit('onShouldClose');
                }
            },
        },
        computed: {
            origin: function () {
                return window.location.origin;
            },
            exportableData: function () {
                const reducedState = stateReducer(this.$store.state);

                const exportableState = {
                    apps: {},
                    panels: reducedState.panels
                };

                const share = {};
                share[reducedState.panels.leftPanel.appId] = reducedState.panels.leftPanel.indexName;
                if (this.$store.state.panels.splitMode) {
                    share[reducedState.panels.rightPanel.appId] = reducedState.panels.rightPanel.indexName;
                } else {
                    reducedState.panels.rightPanel.appId = reducedState.panels.leftPanel.appId;
                    reducedState.panels.rightPanel.indexName = reducedState.panels.leftPanel.indexName;
                }

                Object.keys(share).forEach((appId) => {
                    const indexName = share[appId];
                    const indexData = reducedState.apps[appId][indexName];

                    if (indexData) {
                        const {
                            lastUsed = 0, // Remove last used to allow for caching
                            ...appState
                        } = indexData;
                        exportableState.apps[appId] = {};
                        exportableState.apps[appId].lastIndexName = indexName;
                        exportableState.apps[appId][indexName] = appState;
                    }
                });

                return exportableState;
            }
        },
        methods: {
            copy: function () {
                copy(this.newLink);
                this.copied = true;
            },
            createShortLink: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${endpoint}/state`, {
                    credentials: 'include',
                    method: 'POST',
                    body: JSON.stringify({
                        value: JSON.stringify(this.exportableData),
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                });
                const link = await res.json();
                this.newLink = `${this.origin}/metaparams?code=${link.short_code}`;
            },
        }
    }
</script>
