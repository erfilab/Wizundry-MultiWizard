import Vue from "vue";
import VueRouter from "vue-router";

import ChatBody from "@/components/ChatBody";
import TextArea from "@/components/Paragraph/YDoc";
import AdminPanel from "@/components/DataCollection/AdminPanel";
import Login from "@/components/LoginForm";
import Lobby from "@/components/Lobby";
import MultiThreadDoc from "@/components/MultiWizard/MultiThreadDoc";

import { auth } from "./services/firebase";

import store from "./store/index";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "login",
    component: Login,
  },
  {
    path: "/lobby",
    name: "lobby",
    component: Lobby,
    meta: { requiresAuth: true },
  },
  {
    path: "/chat",
    component: ChatBody,
    name: "chat",
    meta: { requiresAuth: true },
  },
  {
    path: "/text",
    component: TextArea,
    name: "text",
    meta: { requiresAuth: true },
  },
  {
    path: "/multithread",
    component: MultiThreadDoc,
    name: "multi-thread",
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    component: AdminPanel,
    name: "admin",
    meta: { requiresAuth: true },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((x) => x.meta.requiresAuth);

  if (requiresAuth && !auth.currentUser) {
    next("/");
  } else {
    if (auth.currentUser) {
      auth.currentUser
        .getIdToken(true)
        .then(async (idToken) => {
          await store.dispatch("user/loginUserWithToken", idToken).then(() => {
            if (to.name === "login") next("/lobby");
            else if (to.name === "admin" && store.getters["user/getCurrentUser"].role !== 'admin') next('/lobby');
            else next();
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
    next();
  }
});

export default router;
