import Vue from "vue";
import Vuex from "vuex";

import auth from "./modules/auth";
import user from "./modules/user"
import message from "./modules/message"
import text from "./modules/text"

Vue.use(Vuex);

const store = () =>
    new Vuex.Store({
        modules: {
            auth,
            user,
            message,
            text
        }
    });

export default store;