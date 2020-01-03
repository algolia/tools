import Vue from 'vue'
import store from 'common/store/store'
import App from '@/App.vue'
import VueInputAutowidth from 'vue-input-autowidth'

Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(VueInputAutowidth);

new Vue({
    render: h => h(App),
    store: store,
}).$mount('#app');
