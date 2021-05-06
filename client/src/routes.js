import Vue from "vue";
import VueRouter from "vue-router";

import ChatBody from "@/components/ChatBody"
import TextArea from "@/components/Paragraph/Documentation"

import { auth } from './firebase'

Vue.use(VueRouter);

const routes = [
    {
        path: "/", name: "login",
        component: () => import("@/components/LoginForm")
    },
    {path: "/chat", component: ChatBody, name: "chat", meta: {requiresAuth: true}},
    {path: "/text", component: TextArea, name: "text", meta: {requiresAuth: true}},
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

    if (requiresAuth && !auth.currentUser) {
        next('/')
    } else {
        next()
    }
})

export default router;
