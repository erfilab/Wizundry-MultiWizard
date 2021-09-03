import expApi from '../../api/experiment';

const experiment = {
    state: {
        allExperiment: [],
        newExperiment: null,
        currentExperiment: null,
    },

    getters: {
        allExperiment: state => state.allExperiment,
        newExperiment: state => state.newExperiment,
        currentExperiment: state => state.currentExperiment,
    },

    mutations: {
        SET_EXPERIMENT: (state, payload) => {
            state.allExperiment = payload;
        },
        DELETE_EXPERIMENT: (state, payload) => {
            state.allExperiment = state.allExperiment.filter(experiment => experiment.id !== payload);
        },
        ADD_EXPERIMENT: (state, payload) => {
            state.allExperiment.push(payload);
        },
        SET_NEW_EXPERIMENT: (state, payload) => {
            state.newExperiment = payload;
        },
        SET_CURRENT_EXPERIMENT: (state, payload) => {
            state.currentExperiment = payload;
        },
        CLEAR_CURRENT_EXPERIMENT: (state) => {
            state.currentExperiment = null;
        },
    },
    actions: {
        GetAllExperiments: async ({ commit }) => {
            const response = await expApi.getAllExperiments();
            commit('SET_EXPERIMENT', response);
        },
        CreateNewExperiment: async ({ commit }, log) => {
            const response = await expApi.createNewExperiment(log);
            commit('ADD_EXPERIMENT', response);
            commit('SET_NEW_EXPERIMENT', response);
        },
        DeleteExperiment: async ({ commit }, id) => {
            await expApi.deleteExperiment(id);
            commit('DELETE_EXPERIMENT', id);
        },
        GetSingleExperiment: async ({ commit }, id) => {
            const response = await expApi.getSingleExperiment(id);
            commit('SET_CURRENT_EXPERIMENT', response);
        }
    },
};

export default experiment;
