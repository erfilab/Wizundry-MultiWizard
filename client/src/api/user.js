import axios from "./index";
import * as firebase from "../services/firebase";

export default {
  async loginByEmailPassword(params) {
    const { email, password } = params;
    return await firebase.auth
      .signInWithEmailAndPassword(email, password)
      .then(async (res) => {
        return await axios
          .get(`/user/${res.user.uid}`)
          .then((res) => res.data)
          .catch(console.error);
      })
      .catch(console.error);
  },
  async loginUserWithToken(token) {
    return await axios
      .get("/user/loginTK", { headers: { authorization: `Bearer ${token}` } })
      .then((res) => res.data)
      .catch(console.error);
  },
  async createUserAndProject({ userInfo, projectInfo }) {
    return await axios
      .post("/user/create", { userInfo, projectInfo })
      .then((res) => res.data)
      .catch(console.error);
  },
  async fetchAllProjectsAndUsers() {
    return await axios
      .get("/user/index")
      .then((res) => res.data)
      .catch(console.error);
  },
};
