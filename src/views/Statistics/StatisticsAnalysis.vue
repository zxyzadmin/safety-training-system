<template>
  <div class="statistics-analysis">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>统计分析</h1>
          <p>实时监控安全培训数据，提供全面的统计分析和报表功能</p>
        </div>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            class="date-picker"
          />
          <el-button type="primary" @click="exportReport" :icon="Download">
            导出报表
          </el-button>
          <el-button @click="refreshData" :icon="Refresh" :loading="loading">
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="overview-section">
      <el-row :gutter="24">
        <el-col :span="6" v-for="item in overviewData" :key="item.key">
          <div class="overview-card" :class="item.key">
            <div class="overview-icon">
              <component :is="item.icon" />
            </div>
            <div class="overview-content">
              <div class="overview-value">{{ item.value }}</div>
              <div class="overview-label">{{ item.label }}</div>
              <div class="overview-trend" :class="item.trend.type">
                <el-icon>
                  <ArrowUp v-if="item.trend.type === 'up'" />
                  <ArrowDown v-if="item.trend.type === 'down'" />
                  <Minus v-if="item.trend.type === 'stable'" />
                </el-icon>
                <span>{{ item.trend.value }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表分析 -->
    <div class="charts-section">
      <el-row :gutter="24">
        <!-- 培训完成情况 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>培训完成情况</span>
                <el-dropdown @command="handleTrainingCommand" trigger="click">
                  <el-button type="text" :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                      <el-dropdown-item command="export">导出数据</el-dropdown-item>
                      <el-dropdown-item command="refresh">刷新图表</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div ref="trainingChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 档案分类统计 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>档案分类统计</span>
                <el-dropdown @command="handleArchiveCommand" trigger="click">
                  <el-button type="text" :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                      <el-dropdown-item command="export">导出数据</el-dropdown-item>
                      <el-dropdown-item command="refresh">刷新图表</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div ref="archiveChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="24" style="margin-top: 24px;">
        <!-- 月度培训趋势 -->
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>月度培训趋势</span>
                <div class="header-controls">
                  <el-radio-group v-model="trendType" size="small" @change="updateTrendChart">
                    <el-radio-button label="training">培训数量</el-radio-button>
                    <el-radio-button label="completion">完成率</el-radio-button>
                    <el-radio-button label="score">平均分数</el-radio-button>
                  </el-radio-group>
                  <el-dropdown @command="handleTrendCommand" trigger="click">
                    <el-button type="text" :icon="MoreFilled" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                        <el-dropdown-item command="export">导出数据</el-dropdown-item>
                        <el-dropdown-item command="fullscreen">全屏显示</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
            <div ref="trendChart" class="chart-container large"></div>
          </el-card>
        </el-col>

        <!-- 标准规范状态 -->
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>标准规范状态</span>
                <el-dropdown @command="handleStandardCommand" trigger="click">
                  <el-button type="text" :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                      <el-dropdown-item command="export">导出数据</el-dropdown-item>
                      <el-dropdown-item command="refresh">刷新图表</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div ref="standardChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详细统计表格 -->
    <div class="table-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>详细统计数据</span>
            <div class="header-controls">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索部门或人员"
                :prefix-icon="Search"
                size="small"
                style="width: 200px; margin-right: 12px;"
                clearable
              />
              <el-select
                v-model="selectedDepartment"
                placeholder="选择部门"
                size="small"
                style="width: 150px; margin-right: 12px;"
                clearable
              >
                <el-option label="全部部门" value="" />
                <el-option label="技术部" value="tech" />
                <el-option label="安全部" value="safety" />
                <el-option label="生产部" value="production" />
                <el-option label="管理部" value="management" />
              </el-select>
              <el-button size="small" @click="exportTableData" :icon="Download">
                导出表格
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="filteredTableData"
          stripe
          border
          class="statistics-table"
        >
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="employee" label="姓名" width="100" />
          <el-table-column prop="position" label="职位" width="120" />
          <el-table-column prop="totalTraining" label="培训总数" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info">{{ row.totalTraining }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="completedTraining" label="已完成" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="success">{{ row.completedTraining }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="completionRate" label="完成率" width="100" align="center">
            <template #default="{ row }">
              <el-progress
                :percentage="row.completionRate"
                :color="getProgressColor(row.completionRate)"
                :stroke-width="6"
                text-inside
              />
            </template>
          </el-table-column>
          <el-table-column prop="averageScore" label="平均分" width="100" align="center">
            <template #default="{ row }">
              <span :class="getScoreClass(row.averageScore)">{{ row.averageScore }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastTraining" label="最近培训" width="120">
            <template #default="{ row }">
              {{ formatDate(row.lastTraining) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="viewDetail(row)">
                查看详情
              </el-button>
              <el-button type="text" size="small" @click="sendReminder(row)">
                发送提醒
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="tableData.length"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 报表预览对话框 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="报表预览"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="report-preview">
        <div class="report-header">
          <h3>安全培训统计报表</h3>
          <div class="report-info">
            <p>统计周期：{{ reportPeriod }}</p>
            <p>生成时间：{{ formatDateTime(new Date()) }}</p>
          </div>
        </div>
        
        <div class="report-content">
          <div class="report-section">
            <h4>数据概览</h4>
            <el-row :gutter="16">
              <el-col :span="12" v-for="item in overviewData" :key="item.key">
                <div class="report-item">
                  <span class="report-label">{{ item.label }}：</span>
                  <span class="report-value">{{ item.value }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="report-section">
            <h4>部门完成情况</h4>
            <el-table :data="departmentSummary" size="small" border>
              <el-table-column prop="department" label="部门" />
              <el-table-column prop="totalEmployees" label="总人数" align="center" />
              <el-table-column prop="completedEmployees" label="已完成人数" align="center" />
              <el-table-column prop="completionRate" label="完成率" align="center">
                <template #default="{ row }">
                  {{ row.completionRate }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="downloadReport">
            下载报表
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import {
  Download,
  Refresh,
  MoreFilled,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Document,
  PieChart,
  TrendCharts
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const dateRange = ref(['2024-01-01', '2024-01-31'])
const trendType = ref('training')
const searchKeyword = ref('')
const selectedDepartment = ref('')
const reportDialogVisible = ref(false)

// 图表实例
const trainingChart = ref()
const archiveChart = ref()
const trendChart = ref()
const standardChart = ref()

let trainingChartInstance: any = null
let archiveChartInstance: any = null
let trendChartInstance: any = null
let standardChartInstance: any = null

// 概览数据
const overviewData = ref([
  {
    key: 'total-training',
    label: '培训总数',
    value: '156',
    icon: 'Document',
    trend: { type: 'up', value: '+12%' }
  },
  {
    key: 'completed-training',
    label: '已完成培训',
    value: '142',
    icon: 'User',
    trend: { type: 'up', value: '+8%' }
  },
  {
    key: 'completion-rate',
    label: '完成率',
    value: '91.2%',
    icon: 'PieChart',
    trend: { type: 'up', value: '+3.2%' }
  },
  {
    key: 'average-score',
    label: '平均分数',
    value: '88.5',
    icon: 'TrendCharts',
    trend: { type: 'stable', value: '0%' }
  }
])

// 表格数据
const tableData = ref([
  {
    id: 1,
    department: '技术部',
    employee: '张三',
    position: '高级工程师',
    totalTraining: 12,
    completedTraining: 11,
    completionRate: 92,
    averageScore: 88,
    lastTraining: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    department: '安全部',
    employee: '李四',
    position: '安全专员',
    totalTraining: 15,
    completedTraining: 15,
    completionRate: 100,
    averageScore: 95,
    lastTraining: '2024-01-20',
    status: 'active'
  },
  {
    id: 3,
    department: '生产部',
    employee: '王五',
    position: '生产主管',
    totalTraining: 8,
    completedTraining: 6,
    completionRate: 75,
    averageScore: 82,
    lastTraining: '2024-01-10',
    status: 'warning'
  },
  {
    id: 4,
    department: '管理部',
    employee: '赵六',
    position: '部门经理',
    totalTraining: 10,
    completedTraining: 9,
    completionRate: 90,
    averageScore: 90,
    lastTraining: '2024-01-18',
    status: 'active'
  },
  {
    id: 5,
    department: '技术部',
    employee: '孙七',
    position: '工程师',
    totalTraining: 12,
    completedTraining: 8,
    completionRate: 67,
    averageScore: 78,
    lastTraining: '2024-01-05',
    status: 'delayed'
  }
])

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 计算属性
const filteredTableData = computed(() => {
  let result = tableData.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.employee.toLowerCase().includes(keyword) ||
      item.department.toLowerCase().includes(keyword) ||
      item.position.toLowerCase().includes(keyword)
    )
  }

  if (selectedDepartment.value) {
    result = result.filter(item => {
      const departmentMap: Record<string, string> = {
        tech: '技术部',
        safety: '安全部',
        production: '生产部',
        management: '管理部'
      }
      return item.department === departmentMap[selectedDepartment.value]
    })
  }

  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

const reportPeriod = computed(() => {
  if (dateRange.value && dateRange.value.length === 2) {
    return `${dateRange.value[0]} 至 ${dateRange.value[1]}`
  }
  return '全部时间'
})

const departmentSummary = computed(() => {
  const summary: Record<string, any> = {}
  
  tableData.value.forEach(item => {
    if (!summary[item.department]) {
      summary[item.department] = {
        department: item.department,
        totalEmployees: 0,
        completedEmployees: 0
      }
    }
    summary[item.department].totalEmployees++
    if (item.completionRate >= 90) {
      summary[item.department].completedEmployees++
    }
  })

  return Object.values(summary).map((item: any) => ({
    ...item,
    completionRate: Math.round((item.completedEmployees / item.totalEmployees) * 100)
  }))
})

// 工具方法
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (date: Date) => {
  return date.toLocaleString('zh-CN')
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-poor'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    warning: 'warning',
    delayed: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '正常',
    warning: '注意',
    delayed: '延期'
  }
  return texts[status] || status
}

// 图表初始化
const initTrainingChart = () => {
  if (!trainingChart.value) return

  trainingChartInstance = echarts.init(trainingChart.value)
  const option = {
    title: {
      text: '培训完成情况',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [
      {
        name: '培训状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 142, name: '已完成', itemStyle: { color: '#67c23a' } },
          { value: 14, name: '进行中', itemStyle: { color: '#e6a23c' } },
          { value: 8, name: '未开始', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }
  trainingChartInstance.setOption(option)
}

const initArchiveChart = () => {
  if (!archiveChart.value) return

  archiveChartInstance = echarts.init(archiveChart.value)
  const option = {
    title: {
      text: '档案分类统计',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['培训档案', '证书档案', '检查档案', '事故档案', '标准档案'],
      axisLabel: { fontSize: 10 }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '档案数量',
        type: 'bar',
        data: [85, 45, 32, 12, 28],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#79bbff' }
          ])
        }
      }
    ]
  }
  archiveChartInstance.setOption(option)
}

const initTrendChart = () => {
  if (!trendChart.value) return

  trendChartInstance = echarts.init(trendChart.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChartInstance) return

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  
  let data: number[] = []
  let yAxisName = ''
  let seriesName = ''

  switch (trendType.value) {
    case 'training':
      data = [12, 15, 18, 14, 20, 16, 22, 25, 19, 17, 21, 24]
      yAxisName = '培训数量'
      seriesName = '培训数量'
      break
    case 'completion':
      data = [85, 88, 92, 89, 94, 91, 96, 98, 93, 90, 95, 97]
      yAxisName = '完成率(%)'
      seriesName = '完成率'
      break
    case 'score':
      data = [82, 85, 88, 86, 90, 87, 92, 94, 89, 88, 91, 93]
      yAxisName = '平均分数'
      seriesName = '平均分数'
      break
  }

  const option = {
    title: {
      text: '月度培训趋势',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months
    },
    yAxis: {
      type: 'value',
      name: yAxisName
    },
    series: [
      {
        name: seriesName,
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: data,
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  }
  trendChartInstance.setOption(option)
}

const initStandardChart = () => {
  if (!standardChart.value) return

  standardChartInstance = echarts.init(standardChart.value)
  const option = {
    title: {
      text: '标准规范状态',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '规范状态',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 45, name: '有效', itemStyle: { color: '#67c23a' } },
          { value: 8, name: '即将过期', itemStyle: { color: '#e6a23c' } },
          { value: 3, name: '已失效', itemStyle: { color: '#f56c6c' } },
          { value: 6, name: '草稿', itemStyle: { color: '#909399' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  standardChartInstance.setOption(option)
}

// 事件处理
const handleDateChange = () => {
  refreshData()
}

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新概览数据
    overviewData.value.forEach(item => {
      const randomChange = Math.random() * 10 - 5
      if (item.key === 'completion-rate') {
        item.trend.value = `${randomChange > 0 ? '+' : ''}${randomChange.toFixed(1)}%`
      } else {
        item.trend.value = `${randomChange > 0 ? '+' : ''}${Math.floor(randomChange)}%`
      }
      item.trend.type = randomChange > 0 ? 'up' : randomChange < 0 ? 'down' : 'stable'
    })

    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const exportReport = () => {
  reportDialogVisible.value = true
}

const downloadReport = () => {
  ElMessage.success('报表导出成功')
  reportDialogVisible.value = false
}

const exportTableData = () => {
  ElMessage.success('表格数据导出成功')
}

const handleTrainingCommand = (command: string) => {
  switch (command) {
    case 'detail':
      ElMessage.info('查看培训详情')
      break
    case 'export':
      ElMessage.success('培训数据导出成功')
      break
    case 'refresh':
      initTrainingChart()
      ElMessage.success('图表刷新成功')
      break
  }
}

const handleArchiveCommand = (command: string) => {
  switch (command) {
    case 'detail':
      ElMessage.info('查看档案详情')
      break
    case 'export':
      ElMessage.success('档案数据导出成功')
      break
    case 'refresh':
      initArchiveChart()
      ElMessage.success('图表刷新成功')
      break
  }
}

const handleTrendCommand = (command: string) => {
  switch (command) {
    case 'detail':
      ElMessage.info('查看趋势详情')
      break
    case 'export':
      ElMessage.success('趋势数据导出成功')
      break
    case 'fullscreen':
      ElMessage.info('全屏显示功能')
      break
  }
}

const handleStandardCommand = (command: string) => {
  switch (command) {
    case 'detail':
      ElMessage.info('查看标准详情')
      break
    case 'export':
      ElMessage.success('标准数据导出成功')
      break
    case 'refresh':
      initStandardChart()
      ElMessage.success('图表刷新成功')
      break
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const viewDetail = (row: any) => {
  ElMessage.info(`查看 ${row.employee} 的详细信息`)
}

const sendReminder = (row: any) => {
  ElMessage.success(`已向 ${row.employee} 发送培训提醒`)
}

// 响应式处理
const handleResize = () => {
  nextTick(() => {
    trainingChartInstance?.resize()
    archiveChartInstance?.resize()
    trendChartInstance?.resize()
    standardChartInstance?.resize()
  })
}

// 组件生命周期
onMounted(() => {
  nextTick(() => {
    initTrainingChart()
    initArchiveChart()
    initTrendChart()
    initStandardChart()
  })

  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-analysis {
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
  align-items: flex-start;
  gap: var(--spacing-lg);
}

.title-section h1 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.title-section p {
  font-size: var(--font-md);
  color: var(--text-secondary);
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-shrink: 0;
}

.date-picker {
  width: 300px;
}

.overview-section {
  margin-bottom: var(--spacing-xl);
}

.overview-card {
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

.overview-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.overview-card.total-training {
  border-left: 4px solid #409eff;
}

.overview-card.completed-training {
  border-left: 4px solid #67c23a;
}

.overview-card.completion-rate {
  border-left: 4px solid #e6a23c;
}

.overview-card.average-score {
  border-left: 4px solid #f56c6c;
}

.overview-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: var(--primary-lighter);
  color: var(--primary-color);
  font-size: 28px;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
}

.overview-value {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.overview-label {
  font-size: var(--font-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.overview-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.overview-trend.up {
  color: var(--success-color);
}

.overview-trend.down {
  color: var(--danger-color);
}

.overview-trend.stable {
  color: var(--text-secondary);
}

.charts-section {
  margin-bottom: var(--spacing-xl);
}

.chart-card {
  height: 400px;
}

.chart-card .chart-container {
  height: 320px;
}

.chart-card .chart-container.large {
  height: 320px;
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

.table-section {
  margin-bottom: var(--spacing-xl);
}

.statistics-table {
  margin-bottom: var(--spacing-lg);
}

.score-excellent {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}

.score-good {
  color: var(--primary-color);
  font-weight: var(--font-medium);
}

.score-average {
  color: var(--warning-color);
  font-weight: var(--font-medium);
}

.score-poor {
  color: var(--danger-color);
  font-weight: var(--font-semibold);
}

.table-pagination {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-lg);
}

.report-preview {
  padding: var(--spacing-lg);
}

.report-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-light);
}

.report-header h3 {
  font-size: var(--font-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.report-info p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0;
}

.report-section {
  margin-bottom: var(--spacing-xl);
}

.report-section h4 {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-light);
}

.report-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-lighter);
}

.report-label {
  color: var(--text-secondary);
}

.report-value {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .date-picker {
    width: 100%;
  }

  .overview-card {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);
  }

  .chart-card {
    height: 300px;
  }

  .chart-card .chart-container,
  .chart-card .chart-container.large {
    height: 220px;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .card-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }
}

/* 深色主题适配 */
.dark .overview-card {
  background-color: var(--bg-secondary);
  border-color: var(--border-light);
}

.dark .overview-card:hover {
  border-color: var(--primary-color);
}

.dark .overview-icon {
  background-color: rgba(30, 136, 229, 0.2);
}

.dark .report-preview {
  background-color: var(--bg-secondary);
}
</style>