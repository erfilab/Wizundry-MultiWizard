import * as firebase from "../../firebase"
import router from '../../routes'

export default {
    namespaced: true,
    state: {
        currentUser: null,
    },
    getters: {
        getCurrentUser: state => state.currentUser
    },
    mutations: {
        setCurrentUser(state, userInfo) {
            state.currentUser = userInfo;
        },
    },
    actions: {
        async loginUser({commit}, userInfo) {
            await firebase.auth.signInWithEmailAndPassword(userInfo.email, userInfo.password)
            commit('setCurrentUser', userInfo)

            if (router.currentRoute.path === '/') {
                await router.push('/text')
            }
        }
    }
};
