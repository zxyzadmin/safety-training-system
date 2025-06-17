<template>
  <div class="dashboard fade-in">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner slide-up">
      <div class="banner-content">
        <div class="welcome-text">
          <h1>欢迎回来，{{ authStore.currentUser?.name }}</h1>
          <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
        </div>
        <div class="weather-info">
          <el-icon><Sunny /></el-icon>
          <span>22°C 晴</span>
          <!-- 新图标展示 -->
          <div class="header-actions">
            <NotificationIcon :badge="true" :badge-count="3" @click="handleNotificationClick" />
            <SearchIcon @click="handleSearchClick" />
            <SettingsIcon @click="handleSettingsClick" />
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card hover-lift stagger-animation" v-for="stat in stats" :key="stat.title">
        <div class="stat-content">
          <div class="stat-info">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.title }}</p>
          </div>
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
        </div>
        <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
          <el-icon>
            <component :is="stat.trend > 0 ? ArrowUp : ArrowDown" />
          </el-icon>
          <span>{{ Math.abs(stat.trend) }}%</span>
          <span class="trend-text">较上月</span>
        </div>
      </div>
    </div>

    <!-- 主要功能区 -->
    <div class="main-sections">
      <!-- 左侧：快速操作和最近活动 -->
      <div class="left-section">
        <!-- 快速操作 -->
        <div class="section-card slide-in-left">
          <div class="section-header">
            <h2>快速操作</h2>
            <RefreshIcon @refresh="refreshQuickActions" />
          </div>
          <div class="quick-actions">
            <div 
              class="action-item" 
              v-for="action in quickActions" 
              :key="action.title"
              @click="handleQuickAction(action.route)"
            >
              <div class="action-icon" :style="{ backgroundColor: action.color }">
                <el-icon><component :is="action.icon" /></el-icon>
              </div>
              <div class="action-content">
                <h4>{{ action.title }}</h4>
                <p>{{ action.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近活动 -->
        <div class="section-card slide-in-right">
          <div class="section-header">
            <h2>最近活动</h2>
            <div class="header-actions">
              <DownloadIcon @click="exportActivities" />
              <el-button type="text" @click="$router.push('/personal')">
                查看全部
              </el-button>
            </div>
          </div>
          <div class="activity-list">
            <div 
              class="activity-item" 
              v-for="activity in recentActivities" 
              :key="activity.id"
            >
              <div class="activity-avatar">
                <el-avatar :size="32">{{ activity.user.charAt(0) }}</el-avatar>
              </div>
              <div class="activity-content">
                <p><strong>{{ activity.user }}</strong> {{ activity.action }}</p>
                <span class="activity-time">{{ formatTime(activity.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：待办事项和系统公告 -->
      <div class="right-section">
        <!-- 待办事项 -->
        <div class="section-card">
          <div class="section-header">
            <h2>待办事项</h2>
            <el-badge :value="pendingTasks.length" type="danger" />
          </div>
          <div class="todo-list">
            <div 
              class="todo-item" 
              v-for="task in pendingTasks" 
              :key="task.id"
              :class="{ urgent: task.urgent }"
            >
              <el-checkbox 
                v-model="task.completed" 
                @change="handleTaskComplete(task)"
              />
              <div class="todo-content">
                <h4>{{ task.title }}</h4>
                <p>{{ task.description }}</p>
                <span class="todo-due">截止：{{ task.dueDate }}</span>
              </div>
              <el-tag 
                v-if="task.urgent" 
                type="danger" 
                size="small"
              >
                紧急
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 系统公告 -->
        <div class="section-card">
          <div class="section-header">
            <h2>系统公告</h2>
          </div>
          <div class="announcement-list">
            <div 
              class="announcement-item" 
              v-for="announcement in announcements" 
              :key="announcement.id"
            >
              <div class="announcement-header">
                <h4>{{ announcement.title }}</h4>
                <span class="announcement-date">{{ announcement.date }}</span>
              </div>
              <p>{{ announcement.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 培训进度图表 -->
    <div class="chart-section">
      <div class="section-card">
        <div class="section-header">
          <h2>培训完成情况</h2>
          <div class="chart-filters">
            <el-select v-model="chartTimeRange" size="small">
              <el-option label="最近7天" value="7d" />
              <el-option label="最近30天" value="30d" />
              <el-option label="最近3个月" value="3m" />
            </el-select>
          </div>
        </div>
        <div class="chart-container">
          <v-chart :option="chartOption" style="height: 300px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sunny, 
  ArrowUp, 
  ArrowDown,
  Upload,
  Document,
  User,
  TrendCharts
} from '@element-plus/icons-vue'
import NotificationIcon from '@/components/Icons/NotificationIcon.vue'
import SearchIcon from '@/components/Icons/SearchIcon.vue'
import SettingsIcon from '@/components/Icons/SettingsIcon.vue'
import DownloadIcon from '@/components/Icons/DownloadIcon.vue'
import RefreshIcon from '@/components/Icons/RefreshIcon.vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useAuthStore } from '@/store/auth'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const router = useRouter()
const authStore = useAuthStore()

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据
const stats = ref([
  {
    title: '培训资料总数',
    value: '156',
    trend: 12,
    color: '#409eff',
    icon: Document
  },
  {
    title: '参与人数',
    value: '1,234',
    trend: 8,
    color: '#67c23a',
    icon: User
  },
  {
    title: '本月新增',
    value: '45',
    trend: -3,
    color: '#e6a23c',
    icon: Upload
  },
  {
    title: '完成率',
    value: '89%',
    trend: 15,
    color: '#f56c6c',
    icon: TrendCharts
  }
])

// 快速操作
const quickActions = ref([
  {
    title: '上传培训资料',
    description: '快速上传新的培训文档',
    icon: Upload,
    color: '#409eff',
    route: '/training/upload'
  },
  {
    title: '查看培训资料',
    description: '浏览所有可用的培训资料',
    icon: Document,
    color: '#67c23a',
    route: '/training'
  },
  {
    title: '统计分析',
    description: '查看详细的数据分析报告',
    icon: TrendCharts,
    color: '#e6a23c',
    route: '/statistics'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    user: '张三',
    action: '上传了新的培训资料《消防安全知识》',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    user: '李四',
    action: '完成了《工作安全规范》培训',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 3,
    user: '王五',
    action: '审批通过了《电气安全》培训资料',
    time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  }
])

// 待办事项
const pendingTasks = ref([
  {
    id: 1,
    title: '审批培训资料',
    description: '3个新上传的培训资料等待审批',
    dueDate: '今天',
    urgent: true,
    completed: false
  },
  {
    id: 2,
    title: '更新安全规范',
    description: '根据新规定更新现有安全规范文档',
    dueDate: '明天',
    urgent: false,
    completed: false
  },
  {
    id: 3,
    title: '培训效果评估',
    description: '对本月培训效果进行统计和评估',
    dueDate: '本周五',
    urgent: false,
    completed: false
  }
])

// 系统公告
const announcements = ref([
  {
    id: 1,
    title: '系统更新通知',
    content: '系统已更新至v2.0版本，新增了多项功能，请及时体验。',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: '春节放假通知',
    content: '春节期间系统正常运行，值班人员请注意系统监控。',
    date: '2024-01-10'
  }
])

// 图表时间范围
const chartTimeRange = ref('30d')

// 图表配置
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['培训完成数', '新增资料数']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '培训完成数',
      type: 'line',
      data: [120, 132, 101, 134, 90, 230, 210],
      smooth: true,
      itemStyle: { color: '#409eff' }
    },
    {
      name: '新增资料数',
      type: 'bar',
      data: [20, 25, 18, 22, 15, 35, 28],
      itemStyle: { color: '#67c23a' }
    }
  ]
}))

// 处理快速操作
const handleQuickAction = (route: string) => {
  router.push(route)
}

// 处理任务完成
const handleTaskComplete = (task: any) => {
  // TODO: 实现任务完成逻辑
  console.log('任务完成:', task)
}

// 格式化时间
const formatTime = (timeStr: string) => {
  return formatDistanceToNow(new Date(timeStr), {
    addSuffix: true,
    locale: zhCN
  })
}

// 新图标处理函数
const handleNotificationClick = () => {
  console.log('通知点击')
  // TODO: 显示通知列表
}

const handleSearchClick = () => {
  console.log('搜索点击')
  // TODO: 打开搜索界面
}

const handleSettingsClick = () => {
  console.log('设置点击')
  router.push('/settings')
}

const refreshQuickActions = () => {
  console.log('刷新快速操作')
  // TODO: 重新加载快速操作数据
}

const exportActivities = () => {
  console.log('导出活动数据')
  // TODO: 导出最近活动数据
}

onMounted(() => {
  // 初始化数据
  console.log('Dashboard mounted')
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.welcome-banner {
  background: var(--gradient-primary);
  color: white;
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-card);
  opacity: 0.1;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.welcome-text h1 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-sm);
}

.welcome-text p {
  font-size: var(--font-md);
  opacity: 0.9;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-lg);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-left: var(--spacing-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal) var(--ease-out-quart);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transition: transform var(--transition-normal) var(--ease-out-quart);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.stat-info h3 {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-info p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.stat-card:hover .stat-icon::before {
  opacity: 1;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
}

.stat-trend.positive {
  color: var(--success-color);
}

.stat-trend.negative {
  color: var(--danger-color);
}

.trend-text {
  color: var(--text-secondary);
}

.main-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.section-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal) var(--ease-out-quart);
}

.section-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.section-header h2 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition-fast) var(--ease-out-quart);
  position: relative;
  overflow: hidden;
}

.action-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--gradient-card);
  transition: left var(--transition-normal) var(--ease-out-quart);
}

.action-item:hover {
  background-color: var(--selection-bg);
  border-color: var(--primary-light);
  transform: translateX(4px);
}

.action-item:hover::before {
  left: 0;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.action-content h4 {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.action-content p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.activity-list,
.todo-list,
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.activity-content p {
  font-size: var(--font-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.activity-time {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.todo-item {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: border-color var(--transition-fast);
}

.todo-item.urgent {
  border-color: var(--danger-color);
  background-color: rgba(245, 108, 108, 0.05);
}

.todo-content {
  flex: 1;
}

.todo-content h4 {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.todo-content p {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.todo-due {
  font-size: var(--font-xs);
  color: var(--text-disabled);
}

.announcement-item {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
  background-color: var(--bg-secondary);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.announcement-header h4 {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.announcement-date {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.announcement-item p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.chart-section {
  margin-bottom: var(--spacing-xl);
}

.chart-filters {
  display: flex;
  gap: var(--spacing-sm);
}

.chart-container {
  margin-top: var(--spacing-lg);
}

/* 新增样式 */
.stagger-animation:nth-child(1) { animation-delay: 0s; }
.stagger-animation:nth-child(2) { animation-delay: 0.1s; }
.stagger-animation:nth-child(3) { animation-delay: 0.2s; }
.stagger-animation:nth-child(4) { animation-delay: 0.3s; }

/* 响应式设计 */
@media (max-width: 768px) {
  .main-sections {
    grid-template-columns: 1fr;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .weather-info {
    flex-direction: column;
  }
  
  .header-actions {
    margin-left: 0;
    margin-top: var(--spacing-sm);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card:hover {
    transform: none;
  }
}
</style>