import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LayoutView from '@/views/home/LayoutView.vue'
import LogoView from '../views/home/LogoView.vue'
import HomeView from '../views/tables/HomeView.vue'
import { useUserStore } from '@/stores/login'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/layout',
    name: 'layout',
    component: LayoutView,
    children: [
      {
        path: '/home',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/submit',
        name: 'submit',
        component: () => import('../views/rejected plan/SubmitView.vue'),
      },
      {
        path: '/dataChange',
        name: 'dataChange',
        component: () => import('../views/submit/DataChangeView.vue'),
      },
      {
        path: '/background',
        name: 'background',
        component: () => import('../views/rejected plan/BackgroundView.vue'),
      },
      {
        path: '/chat/:chatName',
        name: 'chat',
        component: () => import('../views/chat/ChatView.vue'),
      },
    ],
  },
  {
    path: '/',
    name: 'logo',
    component: LogoView,
  },
  {
    path: '/login',
    name: 'login',
    // 登录路由, 经过路由守卫拦截后强行进入登录
    component: () => import('../views/login/LoginView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由解析守卫
// 注意: index 只能在守卫中使用 pinia
router.beforeEach(async (to) => {
  const userStore = useUserStore()
  if (to.name !== 'login' && to.name !== 'logo' && userStore.token === null) {
    ElMessage({
      message: '未登录, 请先登录',
    })
    return { name: 'login' }
  }
})

export default router
