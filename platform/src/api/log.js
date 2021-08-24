import axios from "./index";

export default {
    async getAllLogs() {
        return await axios.get("/log/multidoc");
    },
    async createLog(params) {
        return await axios.post("/log/multidoc", params);
    }
};
