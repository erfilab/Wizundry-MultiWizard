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

    }
};