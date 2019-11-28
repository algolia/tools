import Vue from 'vue'
import store from 'common/store/store'
import App from '@/App.vue'
import VueInputAutowidth from 'vue-input-autowidth'
import VueHighlightJS from 'vue-highlight.js'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github.css'


Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(VueInputAutowidth);
Vue.use(VueHighlightJS, {
    languages: {
        json,
    }
});

new Vue({
    render: h => h(App),
    store: store,
}).$mount('#app');
