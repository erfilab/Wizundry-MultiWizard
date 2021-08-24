import logApi from '../../api/log';

const log = {
    state: {
        allLogs: [],
        newLog: null,
    },

    getters: {
        allLogs: state => state.allLogs,
        newLog: state => state.newLog,
    },

    mutations: {
        SET_LOGS: (state, logs) => {
            state.allLogs = logs;
        },
        APPEND_LOG: (state, log) => {
            state.allLogs.push(log);
        },
        CLEAR_LOGS: (state) => {
            state.allLogs = [];
        },
        SET_NEW_LOG: (state, log) => {
            state.newLog = log;
        },
    },

    actions: {
        GetAllLogs: async ({ commit }) => {
            const logs = await logApi.getAllLogs();
            console.log(logs);
            commit('SET_LOGS', logs);
        },
        CreateNewLog: async ({ commit }, log) => {
            const newLog = await logApi.createLog(log);
            commit('SET_NEW_LOG', newLog);
            commit('APPEND_LOG', newLog);
        },
        ClearLogs: async ({ commit }) => {
            commit('CLEAR_LOGS');
        },
    },
};

export default log;
