import { createRouter, createWebHistory } from "vue-router";
import LoginView from "./views/LoginView.vue";
import EventListView from "./views/EventListView.vue";
import DashboardView from "./views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/events",
      name: "events",
      component: EventListView,
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.path === "/login" && token) {
    next("/events");
  } else {
    next();
  }
});

export default router;
