import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from './myStorage';

import apps from './modules/apps/apps';
import panels from './modules/panels/panels';
import apilogs from './modules/apilogs';
import indexdiffer from "./modules/indexdiffer";
import relevancetesting from "./modules/relevancetesting";
import stateReducer from "./stateReducer";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        apps,
        panels,
        apilogs,
        indexdiffer,
        relevancetesting,
    },
    plugins: [createPersistedState({
        reducer: stateReducer
    })],
});
