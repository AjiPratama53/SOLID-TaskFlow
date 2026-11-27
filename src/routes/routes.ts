import Dashboard from '@/views/Dashboard.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import TaskDetail from '@/views/TaskDetail.vue'
import ValidateSubmission from '@/views/ValidateSubmission.vue'
import { useSessionStore } from '@/stores/session'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const childrens: RouteRecordRaw[] = [
  { path: '/dashboard', component: Dashboard },
  { path: '/tasks/:id', component: TaskDetail },
  { path: '/submissions/:id', component: ValidateSubmission },
  { path: '/', redirect: '/dashboard' },
]

export const routes: RouteRecordRaw[] = [
  { path: '/login', component: Login },
  { path: '/', component: Home, children: childrens },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach(async (to) => {
  const session = useSessionStore()
  await session.initSession()

  if (to.path === '/login') {
    return session.isAuthenticated ? '/dashboard' : true
  }

  if (!session.isAuthenticated) {
    return {
      path: '/login',
    }
  }

  return true
})
