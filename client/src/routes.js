import Vue from "vue";
import VueRouter from "vue-router";

import ChatBody from "@/components/ChatBody"
import TextArea from "@/components/Paragraph/YDoc"
import AdminPanel from "@/components/DataCollection/AdminPanel";

import axios from 'axios'
import {auth} from './services/firebase'
import * as firebase from "@/services/firebase";

Vue.use(VueRouter);

const routes = [
    {
        path: "/", name: "login",
        component: () => import("@/components/LoginForm"),
        // beforeEnter: async (to, from, next) => await checkToken(to, from, next)
    },
    {
        path: '/lobby', name: "lobby",
        component: () => import('@/components/Lobby')
    },
    {path: "/chat", component: ChatBody, name: "chat", meta: {requiresAuth: true}},
    {path: "/text", component: TextArea, name: "text", meta: {requiresAuth: true}},
    {
        path: "/admin",
        component: AdminPanel,
        name: "admin",
        meta: {requiresAuth: true},
        beforeEnter: async (to, from, next) => {
            await checkAdmin(to, from, next);
        }
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

const client = axios.create({
    baseURL: 'http://localhost:3000',
    json: true
})


const checkAdmin = async (to, from, next) => {
    await firebase.auth.currentUser.getIdToken(true)
        .then((idToken) => {
            client({
                method: 'get',
                url: '/admin',
                headers: {'authorization': `Bearer ${idToken}`}
            }).then(() => {
                next()
            }).catch(err => {
                window.location.href = '/lobby'
                console.log(err)
            })
        }).catch(console.error)
}

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

    if (requiresAuth && !auth.currentUser) {
        next('/')
    } else {
        next()
    }
})

export default router;
