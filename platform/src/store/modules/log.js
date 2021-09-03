import logApi from '../../api/log';

const log = {
    state: {
        allLogs: [],
        newLog: null,
        selectedLogs: [],
    },

    getters: {
        allLogs: state => state.allLogs,
        newLog: state => state.newLog,
        selectedLogs: state => state.selectedLogs,
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
        SET_SELECTED_LOGS: (state, logs) => {
            state.selectedLogs = logs;
        },
        CLEAR_SELECTED_LOGS: (state) => {
            state.selectedLogs = [];
        }
    },

    actions: {
        GetAllLogs: async ({ commit }, params) => {
            const logs = await logApi.getAllLogs(params);
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
        GetExperimentLogsById: async ({ commit }, id) => {
            const logs = await logApi.getExperimentLogsById(id);
            commit('SET_SELECTED_LOGS', logs);
            return logs;
        }
    },
};

export default log;
