import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from "./routes";
import Vuex from 'vuex'
import store from './store'
import VueResource from 'vue-resource'

import dayjs from 'dayjs'
Vue.prototype.dayjs = dayjs;
import { auth } from './services/firebase'


Vue.use(Vuex)
Vue.use(VueResource)

let app
auth.onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      vuetify,
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
})
