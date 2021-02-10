import index from './index'
import Vue from 'vue'

export default function (appId, lastIndexName) {
    return {
        namespaced: true,
        state: {
            key: null,
            lastIndexName: lastIndexName,
            userId: null,
            __app_name: '',
            __app_owner: '',
            __app_uid: '',
            __log_region: '',
        },
        mutations: {
            setLastIndexName(state, payload) {
                Vue.set(state, lastIndexName, payload);
            },
            setAppName: function (state, payload) {
                Vue.set(state, '__app_name', payload);
            },
            setAppOwner: function (state, payload) {
                Vue.set(state, '__app_owner', payload);
            },
            setUId: function (state, payload) {
                Vue.set(state, '__app_uid', payload);
            },
            setUserId: function (state, payload) {
                Vue.set(state, 'userId', payload);
            },
            setKey: function (state, payload) {
                Vue.set(state, payload.keyName, payload.value);
            },
            setLogRegion: function (state, payload) {
                Vue.set(state, '__log_region', payload);
            },
            addIndex: function (state, payload) {
                const indexName = payload;
                const modulePath = ['apps', appId, indexName];
                let module = this._modules.get(modulePath);

                if (module === undefined) { // Avoid having mutations registered twice
                    if (!state[indexName]) {
                        this.registerModule(['apps', appId, indexName], index())
                    } else {
                        this.registerModule(['apps', appId, indexName], index(), { preserveState: true })
                    }
                    module = this._modules.get(modulePath);
                }

                module.context.commit('updateLastUsed');
            }
        },
    }
}
