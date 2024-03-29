import axios from 'axios';

const HOST = process.env.NODE_ENV === "production" ? "https://ryanyen2.tech/" : "http://localhost:3000/";
const service = axios.create({
    baseURL: HOST,
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


// // Add a request interceptor
// service.interceptors.request.use(function (config) {
//     const token = localStorage.getItem('jwt');
//     config.headers.Authorization = "Bearer " + token;
//     return config;
// });

export default service;
