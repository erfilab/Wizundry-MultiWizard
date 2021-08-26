import axios from "./index";

export default {
    async getAllLogs() {
        return await axios.get("/log/multidoc")
            .then(res => res.data)
            .catch(err => {
                console.log(err);
                return [];
            }
        );
    },
    async createLog(params) {
        return await axios.post("/log/multidoc", params);
    }
};
