export default {
    namespaced: true,
    state: {
        currentText: null,
        textHistory: []
    },
    getters: {
        getCurrentText: state => state.currentText
    },
    mutations: {
        addTextToHistory(state, newText) {
            state.textHistory = [...state.textHistory, newText]
        },
        setCurrentText(state, text) {
            state.setCurrentText = text
        }
    },
    actions: {

    }
};