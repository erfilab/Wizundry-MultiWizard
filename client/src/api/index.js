import axios from 'axios';

const service = axios.create({
    baseURL: process.env.NODE_ENV==="development"? "http://localhost:3000/" : "https://ryanyen2.me/",
    timeout: 10000
});

// request interceptors
service.interceptors.request.use(
    config => config,
    error => {
        console.log("[Axios]: request error");
        return Promise.reject(error);
    }
);

// response interceptors
service.interceptors.response.use(
    response => {
        console.log("[Axios]: get response");
        return response.data;
    },
    error => {
        const {response = {}} = error;
        const {data = null} = response;
        console.log("error = ", data); // for debug
        return Promise.reject(data || error);
    }
);


// Add a request interceptor
service.interceptors.request.use(function (config) {
    const token = localStorage.getItem('jwt');
    config.headers.Authorization = "Bearer " + token;
    return config;
});

export default service;