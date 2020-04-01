import Vue from 'vue'
import store from 'common/store/store'
import App from '@/App.vue'

Vue.config.productionTip = false;
Vue.config.performance = true;

new Vue({
    render: h => h(App),
    store: store,
}).$mount('#app');
