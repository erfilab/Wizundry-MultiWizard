import Vue from 'vue';
import Vuex from 'vuex';
import syncStorage from './plugins/syncStorage';
import permission from './modules/permission';
import settings from './modules/settings';
import user from './modules/user';
import log from './modules/log';
import experiment from './modules/experiment';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    permission,
    settings,
    user,
    log,
    experiment,
  },

  plugins: [
    syncStorage({}),
  ],

  state: {},
  mutations: {},
  actions: {},
  getters: {},
});
