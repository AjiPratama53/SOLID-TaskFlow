import Dashboard from "@/views/Dashboard.vue";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import TaskDetail from "@/views/TaskDetail.vue";
import ValidateSubmission from "@/views/ValidateSubmission.vue";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { restoreSession } from "@/services/auth";

const childrens: RouteRecordRaw[] = [
  { path: "/dashboard", component: Dashboard },
  { path: "/tasks/:id", component: TaskDetail },
  { path: "/submissions/:id", component: ValidateSubmission },
  { path: "/", redirect: "/dashboard" },
];

export const routes: RouteRecordRaw[] = [
  { path: "/login", component: Login },
  {
    path: "/",
    component: Home,
    children: childrens,
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach(async (to) => {
  const session = await restoreSession();

  if (to.meta.requiresAuth && !session.isLoggedIn) {
    return { path: "/login" };
  }

  if (to.path === "/login" && session.isLoggedIn) {
    return { path: "/" };
  }

  return true;
});
