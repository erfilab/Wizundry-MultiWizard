import router from '../../routes'
import user from '../../api/user'

export default {
    namespaced: true,
    state: {
        currentUser: null,
        projectLists: [],
        userLists: [],
    },
    getters: {
        getCurrentUser: state => state.currentUser,
        projectLists: state => state.projectLists,
        userLists: state => state.userLists,
    },
    mutations: {
        setCurrentUser(state, userInfo) {
            state.currentUser = userInfo;
        },
        appendProjectList(state, projectInfo) {
            state.projectLists.push(projectInfo);
        },
        appendUserList(state, userInfo) {
            state.userLists.push(userInfo);
        }
    },
    actions: {
        async loginUser({commit}, userInfo) {
            await user.loginByEmailPassword(userInfo).then(res => {
                console.log("RES", res)
                commit('setCurrentUser', res)
            })

            if (router.currentRoute.path === '/' && userInfo.role !== 'admin') await router.push('/text')
            else await router.push({name: 'admin'})
        },
        async loginUserWithToken({commit}, token) {
            await user.loginUserWithToken(token).then(res => commit('setCurrentUser', res)).catch(console.error);
        },
        async createUserAndProject({commit}, {userInfo, projectInfo}) {
            await user.createUserAndProject({userInfo, projectInfo}).then(res => {
                commit('appendProjectList', res.projectInfo)
                commit('appendUserList', res.userInfo)
            }).catch(console.error);
        }
    }
};
