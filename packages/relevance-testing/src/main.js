import Vue from 'vue';
import store from 'common/store/store';
import VueRouter from 'vue-router';
import algoliasearch from 'algoliasearch';
import VueInputAutowidth from 'vue-input-autowidth';
import App from "@/App";
import Suite from "@/relevance-testing/suite/Suite";
import Suites from "@/relevance-testing/suites/Suites";

Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(VueInputAutowidth);

Vue.mixin({
    data() {
        return {
            algoliaAppID: process.env.VUE_APP_APP_ID,
            algoliaApiKey: process.env.VUE_APP_SEARCH_ONLY_API_KEY,
            algoliasearch: algoliasearch
        }
    },
});

Vue.use(VueRouter);
const router = new VueRouter({
    mode: 'history',
    base: '/relevance-testing/',
    routes: [
        { path: '/', redirect: '/suites' },
        { path: '/suites', component: Suites },
        { path: '/suites/:suiteId', component: Suite, props: true },
    ],
});


new Vue({
    render: h => h(App),
    router: router,
    store: store,
}).$mount('#app');
