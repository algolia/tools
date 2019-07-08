import index from '@/store/modules/apps/index'
import Vue from 'vue'

export default function (appId, adminApiKey, lastIndexName) {
    return {
        namespaced: true,
        state: {
            key: adminApiKey,
            lastIndexName: lastIndexName,
        },
        mutations: {
            setLastIndexName(state, payload) {
                Vue.set(state, lastIndexName, payload);
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