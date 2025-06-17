import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '用户登录' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台', icon: 'workspace' }
      },
      {
        path: '/training',
        name: 'Training',
        component: () => import('@/views/Training/TrainingList.vue'),
        meta: { title: '培训管理', icon: 'training' }
      },
      {
        path: '/training/upload',
        name: 'TrainingUpload',
        component: () => import('@/views/Training/TrainingUpload.vue'),
        meta: { title: '上传培训资料', icon: 'upload' }
      },
      {
        path: '/training/:id',
        name: 'TrainingDetail',
        component: () => import('@/views/Training/TrainingDetail.vue'),
        meta: { title: '培训详情' }
      },
      {
        path: '/archive',
        name: 'Archive',
        component: () => import('@/views/Archive/ArchiveList.vue'),
        meta: { title: '档案管理', icon: 'archive' }
      },
      {
        path: '/standards',
        name: 'Standards',
        component: () => import('@/views/Standards/StandardsList.vue'),
        meta: { title: '标准规范', icon: 'regulations' }
      },
      {
        path: '/standards/upload',
        name: 'StandardsUpload',
        component: () => import('@/views/Standards/StandardsUpload.vue'),
        meta: { title: '上传标准文件' }
      },
      {
        path: '/standards/:id',
        name: 'StandardsDetail',
        component: () => import('@/views/Standards/StandardsDetail.vue'),
        meta: { title: '标准详情' }
      },
      {
        path: '/standards/:id/version',
        name: 'StandardsVersion',
        component: () => import('@/views/Standards/StandardsVersion.vue'),
        meta: { title: '版本管理' }
      },
      {
        path: '/statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics/StatisticsAnalysis.vue'),
        meta: { title: '统计分析', icon: 'stats' }
      },
      {
        path: '/personal',
        name: 'Personal',
        component: () => import('@/views/Personal/PersonalWorkspace.vue'),
        meta: { title: '个人工作台', icon: 'user' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 安全教育培训档案管理系统`
  }
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
  } else {
    // 如果已登录且访问登录页，重定向到首页
    if (authStore.isAuthenticated && to.name === 'Login') {
      next('/')
      return
    }
  }
  
  next()
})

export default router