import axios from "./index";
import * as firebase from "../services/firebase"

export default {
    async loginByEmailPassword(params) {
        const {email, password } = params
        return await firebase.auth.signInWithEmailAndPassword(email, password).then(async () => {
            // const { uid, name, role } = res.user;
            // return await axios.post('/user/loginEP', { uid, email, name, role, createdAt }).then(res => res.data).catch(console.error)
        }).catch(console.error)
    },
    async loginUserWithToken(token) {
        return await axios.get('/user/loginTK', { headers: {'authorization': `Bearer ${token}`} }).then(res => res.data).catch(console.error);
    },
    async createUserAndProject({userInfo, projectInfo}) {
        console.log({userInfo, projectInfo})
        return await axios.post('/user/create', {userInfo, projectInfo}).then(res => res.data).catch(console.error);
    },
    async fetchAllProjectsAndUsers() {
        return await axios.get('/user/index').then(res => res.data).catch(console.error);
    }
}