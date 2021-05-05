import Vue from "vue";
import VueRouter from "vue-router";

import ChatBody from "@/components/ChatBody"
import LoginForm from "@/components/LoginForm"
import TextArea from "@/components/Documentation"

Vue.use(VueRouter);

const routes = [
    {path: "/", component: LoginForm, name: "login"},
    {path: "/chat", component: ChatBody, name: "chat"},
    {path: "/text", component: TextArea, name: "text"},
];

const router = new VueRouter({
    mode: "history",
    routes
});

export default router;
