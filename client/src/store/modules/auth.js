import router from '../../routes'
import user from '../../api/user'

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
            await user.loginByEmailPassword(userInfo).then(res => {
                console.log("RES", res)
                commit('setCurrentUser', res)
            })

            if (router.currentRoute.path === '/' && userInfo.role !== 'admin') await router.push('/text')
            else await router.push({name: 'admin'})
        }
    }
};
