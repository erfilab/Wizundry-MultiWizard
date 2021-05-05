export default {
    namespaced: true,
    state: {
        userList: []
    },
    getters: {
        getUserList: state => state.userList
    },
    mutations: {
        addUserToUserList(state, newUser) {
            state.userList = [...state.userList, newUser]
        },
    },
    actions: {

    }
};