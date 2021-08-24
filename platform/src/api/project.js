import axios from "./index";

export default {
    async fetchAllProjects() {
        return await axios.get('/project/index').then(res => res.data).catch(console.error);
    }
}