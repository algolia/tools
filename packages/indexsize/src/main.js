import Vue from 'vue'
import App from './App.vue'

// --- highlight.js for syntax highlighting
import VueHighlightJS from 'vue-highlight.js'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github.css'

Vue.use(VueHighlightJS, {
  languages: {
    json,
  }
});
// ---

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
