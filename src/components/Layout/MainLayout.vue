<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <img src="/favicon.svg" alt="Logo" class="sidebar-logo">
        <h2 v-show="!sidebarCollapsed" class="sidebar-title">安全培训系统</h2>
      </div>

      <nav class="sidebar-nav">
        <el-menu
          :default-active="$route.path"
          :collapse="sidebarCollapsed"
          :unique-opened="true"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><WorkspaceIcon /></el-icon>
            <template #title>工作台</template>
          </el-menu-item>

          <el-sub-menu index="training">
            <template #title>
              <el-icon><TrainingIcon /></el-icon>
              <span>培训管理</span>
            </template>
            <el-menu-item index="/training">培训资料</el-menu-item>
            <el-menu-item index="/training/upload">上传资料</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/archive">
            <el-icon><ArchiveIcon /></el-icon>
            <template #title>档案管理</template>
          </el-menu-item>

          <el-sub-menu index="standards">
            <template #title>
              <el-icon><RegulationsIcon /></el-icon>
              <span>标准规范</span>
            </template>
            <el-menu-item index="/standards">标准文件</el-menu-item>
            <el-menu-item index="/standards/upload">上传标准</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/statistics">
            <el-icon><StatsIcon /></el-icon>
            <template #title>统计分析</template>
          </el-menu-item>

          <el-menu-item index="/personal">
            <el-icon><UserIcon /></el-icon>
            <template #title>个人工作台</template>
          </el-menu-item>
        </el-menu>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <el-button
            :icon="sidebarCollapsed ? Expand : Fold"
            circle
            @click="toggleSidebar"
            class="sidebar-toggle"
          />
          
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 通知中心 -->
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
            <el-button :icon="Bell" circle @click="showNotifications" />
          </el-badge>

          <!-- 主题切换 -->
          <el-button
            :icon="isDark ? Sunny : Moon"
            circle
            @click="themeStore.toggleTheme()"
          />

          <!-- 用户菜单 -->
          <el-dropdown @command="handleUserCommand" class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="32" :src="authStore.currentUser?.avatar">
                {{ authStore.currentUser?.name?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ authStore.currentUser?.name }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 通知抽屉 -->
    <NotificationDrawer
      v-model="notificationDrawerVisible"
      @mark-read="handleMarkNotificationRead"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Fold,
  Expand,
  Bell,
  Sunny,
  Moon,
  ArrowDown,
  User,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import NotificationDrawer from '@/components/Notification/NotificationDrawer.vue'

// 图标组件
const WorkspaceIcon = defineAsyncComponent(() => import('@/components/Icons/WorkspaceIcon.vue'))
const TrainingIcon = defineAsyncComponent(() => import('@/components/Icons/TrainingIcon.vue'))
const ArchiveIcon = defineAsyncComponent(() => import('@/components/Icons/ArchiveIcon.vue'))
const RegulationsIcon = defineAsyncComponent(() => import('@/components/Icons/RegulationsIcon.vue'))
const StatsIcon = defineAsyncComponent(() => import('@/components/Icons/StatsIcon.vue'))
const UserIcon = defineAsyncComponent(() => import('@/components/Icons/UserIcon.vue'))

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// 侧边栏状态
const sidebarCollapsed = ref(false)
const notificationDrawerVisible = ref(false)

// 当前路由信息
const currentRoute = computed(() => route)

// 未读通知数量（模拟数据）
const unreadCount = ref(3)

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 显示通知
const showNotifications = () => {
  notificationDrawerVisible.value = true
}

// 处理用户菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/personal')
      break
    case 'settings':
      // TODO: 实现系统设置
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}

// 标记通知为已读
const handleMarkNotificationRead = (id: number) => {
  // TODO: 实现标记通知已读
  unreadCount.value = Math.max(0, unreadCount.value - 1)
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-secondary);
}

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  transition: width var(--transition-normal);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  min-height: var(--header-height);
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  border-radius: 0 24px 24px 0;
  margin: 4px 12px 4px 0;
  padding-left: 20px !important;
  transition: all var(--transition-fast);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--primary-lighter);
  color: var(--primary-color);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--bg-secondary);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: var(--header-height);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  z-index: 99;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.sidebar-toggle {
  border: none;
  background: transparent;
}

.breadcrumb {
  font-size: var(--font-sm);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.notification-badge {
  margin-right: var(--spacing-sm);
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.user-info:hover {
  background-color: var(--bg-secondary);
}

.username {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.dropdown-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform var(--transition-fast);
}

.main-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  background-color: var(--bg-secondary);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    z-index: 1000;
  }

  .sidebar.collapsed {
    width: var(--sidebar-width);
    transform: translateX(0);
  }

  .main-container {
    margin-left: 0;
  }

  .header-left .breadcrumb {
    display: none;
  }

  .user-info .username {
    display: none;
  }
}

/* 深色主题适配 */
.dark .sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(30, 136, 229, 0.2);
}
</style>