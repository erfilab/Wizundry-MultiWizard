import text from '../../api/text';

export default {
    namespaced: true,
    state: {
        textLists: [],
    },
    getters: {
        textLists: state => state.textLists,
    },
    mutations: {
        appendTextData(state, text) {
            state.textLists.push(text);
        }
    },
    actions: {
        async storeTextData({commit}, params) {
            await text.storeTextData(params).then(res => {
                commit('appendTextData', res)
            })
        },
    }
};
