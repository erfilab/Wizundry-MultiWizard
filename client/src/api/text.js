import axios from "./index";

export default {
    async storeTextData(params) {
        return await axios.post('/text/create', params).then(res => res.data).catch(console.error);
    },
    async storeBehaviorLog(params) {
        return await axios.post('/text/behavior', params).then(res => res.data).catch(console.error);
    }
}
