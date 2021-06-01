import axios from "./index";
import * as firebase from "../services/firebase"

export default {
    async loginByEmailPassword(params) {
        const {email, password, name, role, createdAt} = params
        return await firebase.auth.signInWithEmailAndPassword(email, password).then(async (res) => {
            const uid = res.user.uid;
            return await axios.post('/user/loginEP', { uid, email, name, role, createdAt }).then(res => res.data).catch(console.error)
        }).catch(console.error)
    }
}