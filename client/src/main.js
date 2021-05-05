import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from "./routes";
import Vuex from 'vuex'
import store from './store'
import VueResource from 'vue-resource'
import moment from 'moment';

Vue.prototype.moment = moment;

Vue.use(Vuex)
Vue.use(VueResource)

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
