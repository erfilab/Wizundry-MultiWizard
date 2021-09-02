import axios from "./index";

export default {
    async getAllExperiments() {
        return await axios.get(`/experiment`)
            .then(res => res.data)
            .catch(err => {
                console.log(err);
                return [];
            }
            );
    },
    async createNewExperiment(params) {
        return await axios.post("/experiment", params);
    },
    async getSingleExperiment(id) {
        return await axios.get(`/experiment/${id}`)
            .then(res => {
                return res.data[0]
            })
            .catch(err => {
                console.log(err);
                return { };
            });
    },
    async deleteExperiment(id) {
        return await axios.delete(`/experiment/${id}`);
    }
};
