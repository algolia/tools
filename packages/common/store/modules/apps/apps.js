import app from './app'
import Vue from 'vue';
import {appsData} from  '../../initialData'

export default {
    namespaced: true,
    modules: appsData,
    mutations: {
        addAppId(state, payload) {
            const appId = payload.appId;
            const modulePath = ['apps', appId];
            const module = this._modules.get(modulePath);
            const apiKey = payload.apiKey || null;

            if (module !== undefined && state[appId]) {
                if (payload.apiKey) {
                    Vue.set(state[appId], 'key', apiKey);
                }
                return; // Avoid having mutations registered twice
            }

            if (!state[appId]) {
                this.registerModule(['apps', appId], app(appId, apiKey, null));
            } else {
                this.registerModule(['apps', appId], app(appId, apiKey), { preserveState: true });
            }

            if (this.state.panels.leftPanel.appId === null) {
                Vue.set(this.state.panels.leftPanel, 'appId', appId);
            }
            if (this.state.panels.rightPanel.appId === null) {
                Vue.set(this.state.panels.rightPanel, 'appId', appId);
            }
        },
        deleteAppId(state, payload) {
            const appId = payload;
            const modulePath = ['apps', appId];
            const module = this._modules.get(modulePath);
            if (module) {
                this.unregisterModule(modulePath);
            }

            Vue.delete(state, appId);

            let newAppId = null;
            const remainingAppIds = Object.keys(state);

            if (remainingAppIds.length > 0) newAppId = remainingAppIds[0];

            if (this.state.panels.leftPanel.appId === appId) {
                Vue.set(this.state.panels.leftPanel, 'appId', newAppId);
            }

            if (this.state.panels.rightPanel.appId === appId) {
                Vue.set(this.state.panels.rightPanel, 'appId', newAppId);
            }
        }
    }
}