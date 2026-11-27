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
import { restoreSession, sessionInfo } from "@/services/auth";

const childrens: RouteRecordRaw[] = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/tasks/:id", component: TaskDetail },
  { path: "/submissions/:id", component: ValidateSubmission },
];

const routes: RouteRecordRaw[] = [
  { path: "/login", component: Login },
  {
    path: "/",
    component: Home,
    children: childrens,
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const POST_LOGIN_REDIRECT_KEY = "solid_post_login_redirect";

function usePostLoginRedirect() {
  const saved = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);

  if (saved && saved.startsWith("/")) return saved;

  return "/";
}

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

router.beforeEach(async (to) => {
  await restoreSession();

  const session = sessionInfo();

  if (to.fullPath === "/") {
    if (session.isLoggedIn) return usePostLoginRedirect();

    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return { path: "/login", query: { error: "login_failed" } };
  }

  if (to.meta.requiresAuth && !session.isLoggedIn) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.fullPath === "/login" && session.isLoggedIn) {
    return { path: "/" };
  }

  return true;
});
