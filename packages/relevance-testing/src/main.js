import Vue from 'vue';
import store from 'common/store/store';
import VueRouter from 'vue-router';
import VueInputAutowidth from 'vue-input-autowidth';
import App from "@/App";
import Suite from "@/relevance-testing/suite/Suite";
import Suites from "@/relevance-testing/suites/Suites";

Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(VueInputAutowidth);

Vue.use(VueRouter);
const router = new VueRouter({
    mode: 'history',
    base: '/relevance-testing/',
    routes: [
        { path: '/', redirect: '/suites' },
        { path: '/suites', component: Suites },
        { path: '/suites/:suiteId/tests/:testId/runs/:runId', component: Suite, props: true },
        { path: '/suites/:suiteId/runs/:runId/tests/:testId', component: Suite, props: true },
        { path: '/suites/:suiteId/tests/:testId', component: Suite, props: true },
        { path: '/suites/:suiteId/runs/:runId', component: Suite, props: true },
        { path: '/suites/:suiteId', component: Suite, props: true },
    ],
});


new Vue({
    render: h => h(App),
    router: router,
    store: store,
}).$mount('#app');
