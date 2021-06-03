import project from '@/api/project';

export default {
    namespaced: true,
    state: {
        projectLists: [],
    },
    getters: {
        projectLists: state => state.projectLists,
    },
    mutations: {
        appendProjectList(state, projectInfo) {
            state.projectLists.push(projectInfo);
        },
        setProjectList(state, projects) {
            state.projectLists = projects;
        }
    },
    actions: {
        async fetchAllProjects({commit}) {
            await project.fetchAllProjects().then(res => {
                console.log("Res", res)
                commit('setProjectList', res);
            })
        }
    }
};
