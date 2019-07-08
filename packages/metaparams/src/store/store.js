import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from '@/store/myStorage'

import apps from '@/store/modules/apps/apps'
import panels from '@/store/modules/panels/panels'
import stateReducer from "@/store/stateReducer";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
      apps: apps,
      panels: panels,
    },
    plugins: [createPersistedState({
        reducer: stateReducer
    })],
});