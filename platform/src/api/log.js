import axios from "./index";

export default {
    async getAllLogs(params) {
        const queryString = `?start=${encodeURIComponent(params.start)}&end=${encodeURIComponent(params.end)}`;

        return await axios.get(`/log/multdocs/${queryString}`)
            .then(res => res.data)
            .catch(err => {
                console.log(err);
                return [];
            }
        );
    },
    async createLog(params) {
        return await axios.post("/log/multidoc", params);
    },
    async getExperimentLogsById(id) {
        return await axios.get(`/log/multidocs/${id}`)
            .then(res => res.data)
            .catch(err => {
                console.log(err);
                return [];
            }
        );
    }
};
