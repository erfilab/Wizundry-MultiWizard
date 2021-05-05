export default {
    namespaced: true,
    state: {
        messagesList: []
    },
    getters: {
        getMessagesList: state => state.messagesList
    },
    mutations: {
        addMessagesToMessagesList(state, newMessage) {
            state.messagesList = [...state.messagesList, newMessage]
        },
    },
    actions: {

    }
};