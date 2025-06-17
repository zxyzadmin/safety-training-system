<template>
  <el-drawer
    v-model="visible"
    title="通知中心"
    direction="rtl"
    size="400px"
    :before-close="handleClose"
  >
    <div class="notification-content">
      <div class="notification-header">
        <div class="notification-tabs">
          <el-button
            :type="activeTab === 'all' ? 'primary' : 'default'"
            @click="activeTab = 'all'"
            size="small"
          >
            全部 ({{ notifications.length }})
          </el-button>
          <el-button
            :type="activeTab === 'unread' ? 'primary' : 'default'"
            @click="activeTab = 'unread'"
            size="small"
          >
            未读 ({{ unreadNotifications.length }})
          </el-button>
        </div>
        
        <el-button
          v-if="unreadNotifications.length > 0"
          @click="markAllAsRead"
          size="small"
          type="text"
        >
          全部标记为已读
        </el-button>
      </div>

      <div class="notification-list">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <el-icon
              :class="getNotificationIconClass(notification.type)"
              :color="getNotificationColor(notification.type)"
            >
              <component :is="getNotificationIcon(notification.type)" />
            </el-icon>
          </div>

          <div class="notification-body">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-content">{{ notification.content }}</p>
            <div class="notification-meta">
              <span class="notification-time">
                {{ formatTime(notification.createdAt) }}
              </span>
              <el-tag
                v-if="notification.priority === 'high'"
                type="danger"
                size="small"
              >
                重要
              </el-tag>
            </div>
          </div>

          <div class="notification-actions">
            <el-button
              v-if="!notification.isRead"
              @click.stop="markAsRead(notification.id)"
              size="small"
              type="text"
              :icon="Check"
            />
            <el-button
              @click.stop="deleteNotification(notification.id)"
              size="small"
              type="text"
              :icon="Delete"
            />
          </div>
        </div>

        <el-empty
          v-if="filteredNotifications.length === 0"
          :description="activeTab === 'unread' ? '暂无未读通知' : '暂无通知'"
          :image-size="80"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Delete, InfoFilled, WarningFilled, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Notification } from '@/types/common'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'markRead', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref<'all' | 'unread'>('all')

// 模拟通知数据
const notifications = ref<Notification[]>([
  {
    id: 1,
    title: '新的培训资料需要审批',
    content: '用户张三上传了新的安全培训资料《消防安全知识》，请及时审批。',
    type: 'info',
    recipient: 'admin',
    sender: 'system',
    isRead: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    actionUrl: '/training'
  },
  {
    id: 2,
    title: '培训资料审批通过',
    content: '您上传的培训资料《工作安全规范》已通过审批。',
    type: 'success',
    recipient: 'user',
    sender: 'admin',
    isRead: false,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    actionUrl: '/training'
  },
  {
    id: 3,
    title: '系统维护通知',
    content: '系统将在今晚22:00-24:00进行例行维护，期间可能影响使用。',
    type: 'warning',
    recipient: 'all',
    sender: 'system',
    isRead: true,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
  }
])

const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.isRead)
)

const filteredNotifications = computed(() => {
  return activeTab.value === 'unread' 
    ? unreadNotifications.value 
    : notifications.value
})

const getNotificationIcon = (type: string) => {
  const icons = {
    info: InfoFilled,
    warning: WarningFilled,
    success: SuccessFilled,
    error: CircleCloseFilled
  }
  return icons[type as keyof typeof icons] || InfoFilled
}

const getNotificationColor = (type: string) => {
  const colors = {
    info: '#409eff',
    warning: '#e6a23c',
    success: '#67c23a',
    error: '#f56c6c'
  }
  return colors[type as keyof typeof colors] || '#409eff'
}

const getNotificationIconClass = (type: string) => {
  return `notification-icon-${type}`
}

const formatTime = (timeStr: string) => {
  return formatDistanceToNow(new Date(timeStr), {
    addSuffix: true,
    locale: zhCN
  })
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.isRead) {
    markAsRead(notification.id)
  }
  
  if (notification.actionUrl) {
    // TODO: 跳转到相关页面
    console.log('跳转到:', notification.actionUrl)
  }
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.isRead = true
    notification.readAt = new Date().toISOString()
    emit('markRead', id)
  }
}

const markAllAsRead = () => {
  unreadNotifications.value.forEach(notification => {
    notification.isRead = true
    notification.readAt = new Date().toISOString()
  })
  ElMessage.success('已全部标记为已读')
}

const deleteNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    ElMessage.success('通知已删除')
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.notification-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--spacing-md);
}

.notification-tabs {
  display: flex;
  gap: var(--spacing-sm);
}

.notification-list {
  flex: 1;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-bottom: var(--spacing-sm);
  border: 1px solid transparent;
}

.notification-item:hover {
  background-color: var(--bg-secondary);
}

.notification-item.unread {
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.notification-content {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--spacing-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.notification-time {
  font-size: var(--font-xs);
  color: var(--text-disabled);
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

/* 深色主题适配 */
.dark .notification-item.unread {
  background-color: rgba(30, 136, 229, 0.1);
  border-color: var(--primary-color);
}
</style>