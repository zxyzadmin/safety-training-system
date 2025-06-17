<template>
  <div class="personal-workspace">
    <div class="page-header">
      <div class="header-content">
        <div class="user-welcome">
          <div class="user-avatar">
            <el-avatar :size="64" :src="userInfo.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <div class="welcome-text">
            <h1>欢迎回来，{{ userInfo.name }}</h1>
            <p>{{ getCurrentTimeGreeting() }}，今天有 {{ todayTasks.length }} 个待处理任务</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="showProfileDialog" :icon="Edit">
            编辑资料
          </el-button>
          <el-button @click="refreshData" :icon="Refresh" :loading="loading">
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 快速统计 -->
    <div class="quick-stats">
      <el-row :gutter="24">
        <el-col :span="6" v-for="stat in quickStats" :key="stat.key">
          <div class="stat-card" :class="stat.key">
            <div class="stat-icon" :class="stat.iconClass">
              <component :is="stat.icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-action">
                <el-button type="text" size="small" @click="handleStatAction(stat.action)">
                  {{ stat.actionText }}
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="24">
      <!-- 左侧内容 -->
      <el-col :span="16">
        <!-- 待办任务 -->
        <el-card class="workspace-card" style="margin-bottom: 24px;">
          <template #header>
            <div class="card-header">
              <span>待办任务</span>
              <div class="header-controls">
                <el-select v-model="taskFilter" size="small" style="width: 120px;">
                  <el-option label="全部任务" value="all" />
                  <el-option label="今日任务" value="today" />
                  <el-option label="本周任务" value="week" />
                  <el-option label="逾期任务" value="overdue" />
                </el-select>
                <el-button size="small" @click="showAddTaskDialog" :icon="Plus">
                  新建任务
                </el-button>
              </div>
            </div>
          </template>

          <div class="tasks-list">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="task-item"
              :class="{ completed: task.completed, overdue: isTaskOverdue(task) }"
            >
              <div class="task-content">
                <el-checkbox
                  v-model="task.completed"
                  @change="toggleTaskComplete(task)"
                  class="task-checkbox"
                />
                <div class="task-info">
                  <div class="task-title" :class="{ completed: task.completed }">
                    {{ task.title }}
                  </div>
                  <div class="task-meta">
                    <el-tag :type="getPriorityType(task.priority)" size="small">
                      {{ getPriorityText(task.priority) }}
                    </el-tag>
                    <span class="task-date">
                      <el-icon><Calendar /></el-icon>
                      {{ formatDate(task.dueDate) }}
                    </span>
                    <span class="task-category">
                      <el-icon><Folder /></el-icon>
                      {{ task.category }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="task-actions">
                <el-button type="text" size="small" @click="editTask(task)">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="deleteTask(task)" class="danger-text">
                  删除
                </el-button>
              </div>
            </div>

            <div v-if="filteredTasks.length === 0" class="empty-tasks">
              <el-empty description="暂无任务" />
            </div>
          </div>
        </el-card>

        <!-- 培训记录 -->
        <el-card class="workspace-card">
          <template #header>
            <div class="card-header">
              <span>我的培训记录</span>
              <el-button type="text" size="small" @click="viewAllTraining">
                查看全部
              </el-button>
            </div>
          </template>

          <div class="training-records">
            <div
              v-for="record in recentTrainingRecords"
              :key="record.id"
              class="training-record"
            >
              <div class="record-icon">
                <el-icon class="training-icon"><Document /></el-icon>
              </div>
              <div class="record-content">
                <div class="record-title">{{ record.title }}</div>
                <div class="record-meta">
                  <span class="record-date">{{ formatDate(record.completedDate) }}</span>
                  <el-tag :type="getScoreType(record.score)" size="small">
                    {{ record.score }}分
                  </el-tag>
                  <el-tag :type="getStatusType(record.status)" size="small">
                    {{ getStatusText(record.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="record-actions">
                <el-button type="text" size="small" @click="viewTrainingDetail(record)">
                  查看详情
                </el-button>
                <el-button type="text" size="small" @click="downloadCertificate(record)" v-if="record.status === 'passed'">
                  下载证书
                </el-button>
              </div>
            </div>

            <div v-if="recentTrainingRecords.length === 0" class="empty-records">
              <el-empty description="暂无培训记录" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧边栏 -->
      <el-col :span="8">
        <!-- 个人信息 -->
        <el-card class="workspace-card sidebar-card" style="margin-bottom: 24px;">
          <template #header>
            <span>个人信息</span>
          </template>

          <div class="profile-info">
            <div class="profile-avatar">
              <el-avatar :size="80" :src="userInfo.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>
            <div class="profile-details">
              <h3>{{ userInfo.name }}</h3>
              <p class="profile-title">{{ userInfo.position }}</p>
              <p class="profile-department">{{ userInfo.department }}</p>
              
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-label">工号</span>
                  <span class="stat-value">{{ userInfo.employeeId }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">入职时间</span>
                  <span class="stat-value">{{ formatDate(userInfo.joinDate) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">联系方式</span>
                  <span class="stat-value">{{ userInfo.phone }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="workspace-card sidebar-card" style="margin-bottom: 24px;">
          <template #header>
            <span>最近活动</span>
          </template>

          <el-timeline size="small">
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="formatDateTime(activity.timestamp)"
              :type="getActivityType(activity.type)"
            >
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-description">{{ activity.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 快捷操作 -->
        <el-card class="workspace-card sidebar-card">
          <template #header>
            <span>快捷操作</span>
          </template>

          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.key"
              :type="action.type"
              :icon="action.icon"
              @click="handleQuickAction(action.action)"
              class="quick-action-btn"
              block
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="编辑个人资料"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="profileForm.position" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="profileForm.department" placeholder="选择部门">
            <el-option label="技术部" value="技术部" />
            <el-option label="安全部" value="安全部" />
            <el-option label="生产部" value="生产部" />
            <el-option label="管理部" value="管理部" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="profileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProfile" :loading="saving">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新建任务对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="editingTask ? '编辑任务' : '新建任务'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskRules"
        label-width="80px"
      >
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务分类" prop="category">
          <el-select v-model="taskForm.category" placeholder="选择任务分类">
            <el-option label="培训任务" value="培训任务" />
            <el-option label="考试任务" value="考试任务" />
            <el-option label="档案整理" value="档案整理" />
            <el-option label="标准学习" value="标准学习" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="taskForm.priority">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="taskForm.dueDate"
            type="datetime"
            placeholder="选择截止日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="taskDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTask" :loading="saving">
            {{ editingTask ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Edit,
  Refresh,
  Plus,
  Calendar,
  Folder,
  Document,
  TrendCharts,
  Medal,
  Bell,
  Upload
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const profileDialogVisible = ref(false)
const taskDialogVisible = ref(false)
const editingTask = ref(null as any)
const taskFilter = ref('all')

// 表单引用
const profileFormRef = ref<FormInstance>()
const taskFormRef = ref<FormInstance>()

// 用户信息
const userInfo = ref({
  name: '张三',
  position: '高级安全工程师',
  department: '安全部',
  employeeId: 'EMP001',
  phone: '13800138000',
  email: 'zhangsan@company.com',
  joinDate: '2022-01-15',
  avatar: ''
})

// 编辑资料表单
const profileForm = reactive({
  name: '',
  position: '',
  department: '',
  phone: '',
  email: ''
})

// 任务表单
const taskForm = reactive({
  title: '',
  category: '',
  priority: 'medium',
  dueDate: '',
  description: ''
})

// 快速统计
const quickStats = ref([
  {
    key: 'pending-training',
    label: '待完成培训',
    value: '3',
    icon: 'Document',
    iconClass: 'training',
    action: 'viewTraining',
    actionText: '查看培训'
  },
  {
    key: 'training-score',
    label: '培训平均分',
    value: '88.5',
    icon: 'TrendCharts',
    iconClass: 'score',
    action: 'viewScores',
    actionText: '查看成绩'
  },
  {
    key: 'certificates',
    label: '获得证书',
    value: '12',
    icon: 'Medal',
    iconClass: 'certificate',
    action: 'viewCertificates',
    actionText: '查看证书'
  },
  {
    key: 'pending-tasks',
    label: '待办任务',
    value: '5',
    icon: 'Bell',
    iconClass: 'task',
    action: 'viewTasks',
    actionText: '查看任务'
  }
])

// 任务列表
const tasks = ref([
  {
    id: 1,
    title: '完成消防安全培训',
    category: '培训任务',
    priority: 'high',
    dueDate: '2024-01-25 18:00',
    description: '参加消防安全知识培训并通过考试',
    completed: false,
    createdAt: '2024-01-20'
  },
  {
    id: 2,
    title: '提交月度安全报告',
    category: '档案整理',
    priority: 'medium',
    dueDate: '2024-01-30 17:00',
    description: '整理本月安全检查记录并提交报告',
    completed: false,
    createdAt: '2024-01-18'
  },
  {
    id: 3,
    title: '学习新版安全标准',
    category: '标准学习',
    priority: 'low',
    dueDate: '2024-02-05 16:00',
    description: '学习最新发布的安全操作标准GB50016-2024',
    completed: true,
    createdAt: '2024-01-15'
  }
])

// 培训记录
const recentTrainingRecords = ref([
  {
    id: 1,
    title: '危险化学品安全管理培训',
    completedDate: '2024-01-15',
    score: 92,
    status: 'passed'
  },
  {
    id: 2,
    title: '电气安全操作规程培训',
    completedDate: '2024-01-10',
    score: 87,
    status: 'passed'
  },
  {
    id: 3,
    title: '应急预案演练培训',
    completedDate: '2024-01-05',
    score: 95,
    status: 'passed'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    type: 'training',
    title: '完成培训',
    description: '完成了危险化学品安全管理培训，得分92分',
    timestamp: '2024-01-15T14:30:00Z'
  },
  {
    id: 2,
    type: 'task',
    title: '创建任务',
    description: '创建了新的安全检查任务',
    timestamp: '2024-01-14T10:15:00Z'
  },
  {
    id: 3,
    type: 'upload',
    title: '上传文档',
    description: '上传了安全检查记录档案',
    timestamp: '2024-01-12T16:45:00Z'
  }
])

// 快捷操作
const quickActions = ref([
  {
    key: 'upload-training',
    label: '上传培训资料',
    type: 'primary',
    icon: 'Upload',
    action: 'uploadTraining'
  },
  {
    key: 'create-archive',
    label: '创建档案记录',
    type: 'success',
    icon: 'Document',
    action: 'createArchive'
  },
  {
    key: 'view-standards',
    label: '查看标准规范',
    type: 'info',
    icon: 'Folder',
    action: 'viewStandards'
  },
  {
    key: 'check-schedule',
    label: '查看培训计划',
    type: 'warning',
    icon: 'Calendar',
    action: 'checkSchedule'
  }
])

// 表单验证规则
const profileRules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const taskRules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择任务分类', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  dueDate: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ]
}

// 计算属性
const todayTasks = computed(() => {
  const today = new Date().toDateString()
  return tasks.value.filter(task => 
    !task.completed && new Date(task.dueDate).toDateString() === today
  )
})

const filteredTasks = computed(() => {
  let result = tasks.value

  switch (taskFilter.value) {
    case 'today':
      const today = new Date().toDateString()
      result = result.filter(task => 
        new Date(task.dueDate).toDateString() === today
      )
      break
    case 'week':
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      result = result.filter(task => 
        new Date(task.dueDate) <= weekFromNow
      )
      break
    case 'overdue':
      const now = new Date()
      result = result.filter(task => 
        !task.completed && new Date(task.dueDate) < now
      )
      break
  }

  return result.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
})

// 工具方法
const getCurrentTimeGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const isTaskOverdue = (task: any) => {
  return !task.completed && new Date(task.dueDate) < new Date()
}

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return types[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[priority] || priority
}

const getScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  return 'danger'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    passed: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    passed: '通过',
    failed: '未通过',
    pending: '进行中'
  }
  return texts[status] || status
}

const getActivityType = (type: string) => {
  const types: Record<string, string> = {
    training: 'success',
    task: 'primary',
    upload: 'warning'
  }
  return types[type] || 'info'
}

// 事件处理
const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const showProfileDialog = () => {
  Object.assign(profileForm, userInfo.value)
  profileDialogVisible.value = true
}

const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    saving.value = true

    await new Promise(resolve => setTimeout(resolve, 1000))

    Object.assign(userInfo.value, profileForm)
    profileDialogVisible.value = false
    ElMessage.success('个人资料更新成功')
  } catch (error) {
    ElMessage.error('请完善个人资料信息')
  } finally {
    saving.value = false
  }
}

const showAddTaskDialog = () => {
  editingTask.value = null
  Object.assign(taskForm, {
    title: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    description: ''
  })
  taskDialogVisible.value = true
}

const editTask = (task: any) => {
  editingTask.value = task
  Object.assign(taskForm, task)
  taskDialogVisible.value = true
}

const saveTask = async () => {
  if (!taskFormRef.value) return

  try {
    await taskFormRef.value.validate()
    saving.value = true

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingTask.value) {
      Object.assign(editingTask.value, taskForm)
    } else {
      const newTask = {
        id: Date.now(),
        ...taskForm,
        completed: false,
        createdAt: new Date().toISOString()
      }
      tasks.value.unshift(newTask)
    }

    taskDialogVisible.value = false
    ElMessage.success(editingTask.value ? '任务更新成功' : '任务创建成功')
  } catch (error) {
    ElMessage.error('请完善任务信息')
  } finally {
    saving.value = false
  }
}

const toggleTaskComplete = (task: any) => {
  if (task.completed) {
    ElMessage.success(`任务"${task.title}"已完成`)
  }
}

const deleteTask = (task: any) => {
  ElMessageBox.confirm(
    `确定要删除任务"${task.title}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index > -1) {
      tasks.value.splice(index, 1)
      ElMessage.success('任务删除成功')
    }
  }).catch(() => {
    // 用户取消
  })
}

const handleStatAction = (action: string) => {
  switch (action) {
    case 'viewTraining':
      router.push('/training')
      break
    case 'viewScores':
      ElMessage.info('查看培训成绩')
      break
    case 'viewCertificates':
      ElMessage.info('查看获得证书')
      break
    case 'viewTasks':
      taskFilter.value = 'all'
      break
  }
}

const handleQuickAction = (action: string) => {
  switch (action) {
    case 'uploadTraining':
      router.push('/training/upload')
      break
    case 'createArchive':
      router.push('/archive')
      break
    case 'viewStandards':
      router.push('/standards')
      break
    case 'checkSchedule':
      ElMessage.info('查看培训计划')
      break
  }
}

const viewAllTraining = () => {
  router.push('/training')
}

const viewTrainingDetail = (record: any) => {
  ElMessage.info(`查看培训"${record.title}"的详情`)
}

const downloadCertificate = (record: any) => {
  ElMessage.success(`正在下载"${record.title}"的培训证书`)
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.personal-workspace {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-avatar {
  flex-shrink: 0;
}

.welcome-text h1 {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.welcome-text p {
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.quick-stats {
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.stat-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-size: 28px;
  flex-shrink: 0;
}

.stat-icon.training {
  background-color: #e3f2fd;
  color: #1976d2;
}

.stat-icon.score {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.stat-icon.certificate {
  background-color: #fff3e0;
  color: #f57c00;
}

.stat-icon.task {
  background-color: #e8f5e8;
  color: #388e3c;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.workspace-card {
  margin-bottom: var(--spacing-lg);
}

.sidebar-card {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.tasks-list {
  max-height: 400px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-normal);
}

.task-item:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-secondary);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.overdue {
  border-left: 4px solid var(--danger-color);
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  flex: 1;
}

.task-checkbox {
  margin-top: 2px;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.task-title.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.task-date,
.task-category {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.task-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.training-records {
  max-height: 300px;
  overflow-y: auto;
}

.training-record {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-normal);
}

.training-record:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-secondary);
}

.record-icon {
  flex-shrink: 0;
}

.training-icon {
  font-size: 24px;
  color: var(--primary-color);
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.record-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.record-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.profile-info {
  text-align: center;
}

.profile-avatar {
  margin-bottom: var(--spacing-lg);
}

.profile-details h3 {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.profile-title {
  font-size: var(--font-md);
  color: var(--primary-color);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-xs);
}

.profile-department {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.profile-stats {
  text-align: left;
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-lg);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-lighter);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.stat-value {
  color: var(--text-primary);
  font-weight: var(--font-medium);
  font-size: var(--font-sm);
}

.activity-content {
  padding-bottom: var(--spacing-sm);
}

.activity-title {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.activity-description {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.quick-action-btn {
  justify-content: flex-start;
  height: 40px;
}

.empty-tasks,
.empty-records {
  text-align: center;
  padding: var(--spacing-xl);
}

.danger-text {
  color: var(--danger-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .user-welcome {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }

  .header-actions {
    justify-content: center;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);
  }

  .task-item {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .task-content {
    align-items: flex-start;
  }

  .task-actions {
    align-self: flex-end;
  }

  .training-record {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .header-controls {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .card-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }
}

/* 深色主题适配 */
.dark .stat-card {
  background-color: var(--bg-secondary);
  border-color: var(--border-light);
}

.dark .stat-card:hover {
  border-color: var(--primary-color);
}

.dark .task-item {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
}

.dark .task-item:hover {
  background-color: var(--bg-tertiary);
}

.dark .training-record {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
}

.dark .training-record:hover {
  background-color: var(--bg-tertiary);
}

.dark .stat-icon.training {
  background-color: rgba(25, 118, 210, 0.2);
}

.dark .stat-icon.score {
  background-color: rgba(123, 31, 162, 0.2);
}

.dark .stat-icon.certificate {
  background-color: rgba(245, 124, 0, 0.2);
}

.dark .stat-icon.task {
  background-color: rgba(56, 142, 60, 0.2);
}
</style>