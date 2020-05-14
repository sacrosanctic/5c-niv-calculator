import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import axios from 'axios'
import { da } from '@/db.js'

Vue.config.productionTip = false

// alias
Vue.prototype.$axios = axios
Vue.prototype.$da = da

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
