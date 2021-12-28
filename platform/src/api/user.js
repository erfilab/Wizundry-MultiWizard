import axios from "./index";

export default {
  async loginUserByPassword(params) {
    return await axios
      .post("/user/login", { ...params })
      .then(res => res)
      .catch(err => err);
  },
  async fetchAllProjectsAndUsers() {
    return await axios
      .get("/user/index")
      .then((res) => res.data)
      .catch(console.error);
  },
  async startTrial(params) {
    return await axios.post('/user/start', { ...params }).catch(err => err)
  }
};
