import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from './myStorage';

import apps from './modules/apps/apps';
import panels from './modules/panels/panels';
import apilogs from './modules/apilogs';
import stateReducer from "./stateReducer";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        apps: apps,
        panels: panels,
        apilogs: apilogs,
    },
    plugins: [createPersistedState({
        reducer: stateReducer
    })],
});