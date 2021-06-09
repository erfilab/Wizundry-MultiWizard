import user from '../../api/user'

export default {
    namespaced: true,
    state: {
        currentUser: null,
        userLists: [],
        projectUserLists: [],
    },
    getters: {
        getCurrentUser: state => state.currentUser,
        userLists: state => state.userLists,
        projectUserLists: state => state.projectUserLists,
    },
    mutations: {
        setCurrentUser(state, userInfo) {
            state.currentUser = userInfo;
        },
        setUserList(state, users) {
            state.userLists = users;
        },
        setProjectUserLists(state, pus) {
            state.projectUserLists = pus;
        }
    },
    actions: {
        async loginUser({commit}, userInfo) {
            await user.loginByEmailPassword(userInfo).then(res => {
                commit('setCurrentUser', res)
            })
        },
        async loginUserWithToken({commit}, token) {
            await user.loginUserWithToken(token).then(res => {
                commit('setCurrentUser', res)
            }).catch(console.error);
        },
        async createUserAndProject(_, {userInfo, projectInfo}) {
            await user.createUserAndProject({userInfo, projectInfo}).then(res => {
                // commit('project/appendProjectList', res.projectInfo)
                // commit('appendUserList', res.userInfo)
                console.log(res)
            }).catch(console.error);
        },
        async fetchAllProjectsAndUsers({commit}) {
            await user.fetchAllProjectsAndUsers().then(res => {
                commit('setProjectUserLists', res);
            })
        }
    }
};
