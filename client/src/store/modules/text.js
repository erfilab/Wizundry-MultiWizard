import text from '../../api/text';

export default {
    namespaced: true,
    state: {
        textLists: [],
        behaviorLogs: [],
    },
    getters: {
    },
    mutations: {
        appendTextData(state, text) {
            state.textLists.push(text);
        },
        appendBehaviorLogs(state, behavior) {
            state.behaviorLogs.push(behavior);
        }
    },
    actions: {
        async storeTextData({commit}, params) {
            await text.storeTextData(params).then(res => {
                commit('appendTextData', res)
            })
        },
        async storeBehaviorLog({commit}, params) {
            await text.storeBehaviorLog(params).then(res => commit('appendBehaviorLogs', res))
        }
    }
};
