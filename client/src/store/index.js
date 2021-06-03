import Vue from "vue";
import Vuex from "vuex";

import user from "./modules/user"
import message from "./modules/message"
import text from "./modules/text"
import project from "@/store/modules/project";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        project,
        user,
        message,
        text
    },
});