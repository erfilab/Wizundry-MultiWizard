import axios from "./index";

export default {
    async storeTextData(params) {
        return await axios.post('/text/create', params).then(res => res.data).catch(console.error);
    },
    async storeBehaviorLog(params) {
        return await axios.post('/text/behavior', params).then(res => res.data).catch(console.error);
    },
    async storeAnchorLog(params) {
        return await axios.post('/text/anchor', params).then(res => res.data).catch(console.error);
    },
    async listAllTexts(date) {
        return await axios.get(`/text/index${date}`).then(res => res.data).catch(console.error);
    },
    async listAllBehaviors(date) {
        return await axios.get(`/text/behaviors${date}`).then(res => res.data).catch(console.error);
    }
}
