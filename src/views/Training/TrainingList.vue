<template>
  <div class="training-list">
    <div class="page-header">
      <h1>培训资料管理</h1>
      <p>管理和查看所有安全培训资料</p>
    </div>

    <!-- 批量操作栏 -->
    <BatchActions
      :selected-items="selectedTrainings"
      :total-count="paginatedMaterials.length"
      :status-actions="statusActions"
      @select-all="handleSelectAll"
      @clear-selection="clearSelection"
      @delete="handleBatchDelete"
      @export="handleBatchExport"
      @status-change="handleBatchStatusChange"
    />

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <SmartTooltip
          content="支持按标题、描述搜索"
          shortcut="Ctrl+F"
          help="输入关键词快速查找资料"
        >
          <el-input
            ref="searchInput"
            v-model="searchForm.keyword"
            placeholder="搜索培训资料..."
            :prefix-icon="Search"
            clearable
            @input="handleSearchAction"
            class="search-input"
          />
        </SmartTooltip>
        
        <SmartTooltip
          content="上传新的培训资料"
          shortcut="Ctrl+N"
        >
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            上传资料
          </el-button>
        </SmartTooltip>
      </div>

      <div class="filters">
        <el-select
          v-model="searchForm.department"
          placeholder="部门"
          clearable
          @change="handleSearchAction"
        >
          <el-option label="全部部门" value="" />
          <el-option label="安全科" value="安全科" />
          <el-option label="生产部" value="生产部" />
          <el-option label="技术部" value="技术部" />
        </el-select>

        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          clearable
          @change="handleSearchAction"
        >
          <el-option label="全部状态" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>

        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleSearchAction"
        />
      </div>
    </div>

    <!-- 资料列表 -->
    <div class="materials-grid">
      <div
        v-for="material in paginatedMaterials"
        :key="material.id"
        :class="['material-card', { 'selected': isSelected(material) }]"
        @click="viewMaterial(material)"
      >
        <!-- 选择框 -->
        <div class="card-selector" @click.stop="toggleSelection(material)">
          <el-checkbox 
            :model-value="isSelected(material)"
            @change="toggleSelection(material)"
          />
        </div>
        <div class="card-header">
          <h3>{{ material.title }}</h3>
          <el-tag
            :type="getStatusType(material.status)"
            size="small"
          >
            {{ getStatusText(material.status) }}
          </el-tag>
        </div>

        <div class="card-body">
          <p class="material-content">{{ material.content }}</p>
          
          <div class="material-meta">
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ material.instructor }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>{{ material.duration }}课时</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(material.createdAt) }}</span>
            </div>
          </div>

          <div class="material-tags">
            <el-tag
              v-for="tag in material.tags"
              :key="tag"
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="card-footer">
          <div class="stats">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ material.viewCount }}
            </span>
            <span class="stat-item">
              <el-icon><Download /></el-icon>
              {{ material.downloadCount }}
            </span>
          </div>

          <div class="actions">
            <el-button
              size="small"
              type="primary"
              @click.stop="downloadMaterial(material)"
            >
              下载
            </el-button>
            <el-button
              v-if="canEdit(material)"
              size="small"
              @click.stop="editMaterial(material)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canApprove(material)"
              size="small"
              type="success"
              @click.stop="approveMaterial(material)"
            >
              审批
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="filteredMaterials.length"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Plus,
  User,
  Clock,
  Calendar,
  View,
  Download,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useShortcuts, commonShortcuts } from '@/utils/shortcuts'
import SmartTooltip from '@/components/Common/SmartTooltip.vue'
import BatchActions from '@/components/Common/BatchActions.vue'
import { useAuthStore } from '@/store/auth'
import type { TrainingMaterial, SearchFilters, PaginationParams } from '@/types/common'

const router = useRouter()
const authStore = useAuthStore()

// 搜索输入框引用
const searchInput = ref()

// 搜索表单
const searchForm = ref<SearchFilters>({
  keyword: '',
  department: '',
  status: '',
  dateRange: undefined
})

// 分页参数
const pagination = ref<PaginationParams>({
  page: 1,
  pageSize: 12
})

// 批量操作相关
const selectedTrainings = ref<TrainingMaterial[]>([])

// 状态操作选项
const statusActions = ref([
  { label: '设为草稿', value: 'draft', icon: Edit },
  { label: '提交审批', value: 'pending', icon: Clock },
  { label: '通过审批', value: 'approved', icon: View },
  { label: '拒绝审批', value: 'rejected', icon: Delete }
])

// 模拟培训资料数据
const materials = ref<TrainingMaterial[]>([
  {
    id: 1,
    title: '消防安全知识培训',
    content: '包含消防安全基础知识、火灾预防、逃生技巧等重要内容。适用于全体员工的基础安全培训。',
    filename: 'fire_safety_training.pdf',
    fileSize: 2048000,
    fileType: 'pdf',
    topic: '消防安全',
    duration: 4,
    instructor: '张安全',
    department: '安全科',
    username: 'admin',
    status: 'approved',
    approvedBy: 'admin',
    approvedAt: '2024-01-10T10:00:00Z',
    downloadCount: 156,
    viewCount: 234,
    tags: ['消防', '安全', '基础培训'],
    createdAt: '2024-01-08T09:00:00Z'
  },
  {
    id: 2,
    title: '工作安全规范操作指南',
    content: '详细介绍各工种的安全操作规范，包括设备使用、防护措施、应急处理等内容。',
    filename: 'work_safety_guide.pdf',
    fileSize: 3072000,
    fileType: 'pdf',
    topic: '操作安全',
    duration: 6,
    instructor: '李规范',
    department: '生产部',
    username: 'user',
    status: 'pending',
    downloadCount: 89,
    viewCount: 145,
    tags: ['操作规范', '安全防护'],
    createdAt: '2024-01-12T14:30:00Z'
  },
  {
    id: 3,
    title: '电气安全培训教程',
    content: '电气设备安全使用、电击防护、电气火灾预防等专业内容。',
    filename: 'electrical_safety.pptx',
    fileSize: 5120000,
    fileType: 'pptx',
    topic: '电气安全',
    duration: 8,
    instructor: '王电工',
    department: '技术部',
    username: 'admin',
    status: 'approved',
    approvedBy: 'admin',
    approvedAt: '2024-01-05T16:00:00Z',
    downloadCount: 78,
    viewCount: 112,
    tags: ['电气安全', '专业培训'],
    createdAt: '2024-01-02T11:15:00Z'
  }
])

// 过滤后的资料
const filteredMaterials = computed(() => {
  let result = materials.value

  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    result = result.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.content.toLowerCase().includes(keyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  if (searchForm.value.department) {
    result = result.filter(item => item.department === searchForm.value.department)
  }

  if (searchForm.value.status) {
    result = result.filter(item => item.status === searchForm.value.status)
  }

  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const [start, end] = searchForm.value.dateRange
    result = result.filter(item => {
      const itemDate = new Date(item.createdAt)
      return itemDate >= start && itemDate <= end
    })
  }

  return result
})

// 分页后的资料
const paginatedMaterials = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredMaterials.value.slice(start, end)
})

// 获取状态类型
const getStatusType = (status: string) => {
  const types = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status as keyof typeof types] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts = {
    draft: '草稿',
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status as keyof typeof texts] || status
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 搜索处理（原有函数保留，新的handleSearch在下面重新定义）

// 分页处理
const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
}

// 查看资料详情
const viewMaterial = (material: TrainingMaterial) => {
  router.push(`/training/${material.id}`)
}

// 下载资料
const downloadMaterial = (material: TrainingMaterial) => {
  ElMessage.info(`正在下载：${material.filename}`)
  // TODO: 实现实际下载逻辑
}

// 编辑资料
const editMaterial = (material: TrainingMaterial) => {
  router.push(`/training/upload?id=${material.id}`)
}

// 审批资料
const approveMaterial = (material: TrainingMaterial) => {
  router.push(`/training/${material.id}?action=approve`)
}

// 检查是否可以编辑
const canEdit = (material: TrainingMaterial) => {
  return authStore.isAdmin || material.username === authStore.currentUser?.username
}

// 检查是否可以审批
const canApprove = (material: TrainingMaterial) => {
  return authStore.isAdmin && material.status === 'pending'
}

// 选择相关函数
const isSelected = (material: TrainingMaterial) => {
  return selectedTrainings.value.some(item => item.id === material.id)
}

const toggleSelection = (material: TrainingMaterial) => {
  const index = selectedTrainings.value.findIndex(item => item.id === material.id)
  if (index > -1) {
    selectedTrainings.value.splice(index, 1)
  } else {
    selectedTrainings.value.push(material)
  }
}

// 快捷键处理函数
const handleCreate = () => {
  router.push('/training/upload')
}

const handleSearchAction = () => {
  pagination.value.page = 1
}

const focusSearch = () => {
  searchInput.value?.focus()
}

const handleRefresh = () => {
  // TODO: 重新加载数据
  ElMessage.success('数据已刷新')
}

// 批量操作处理函数
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedTrainings.value = [...paginatedMaterials.value]
  } else {
    selectedTrainings.value = []
  }
}

const clearSelection = () => {
  selectedTrainings.value = []
}

const handleBatchDelete = (items: TrainingMaterial[]) => {
  ElMessage.success(`已删除 ${items.length} 个项目`)
  selectedTrainings.value = []
  // TODO: 实现实际删除逻辑
}

const handleBatchExport = (items: TrainingMaterial[]) => {
  ElMessage.success(`正在导出 ${items.length} 个项目...`)
  // TODO: 实现导出逻辑
}

const handleBatchStatusChange = (status: string, items: TrainingMaterial[]) => {
  ElMessage.success(`已将 ${items.length} 个项目状态设为: ${getStatusText(status)}`)
  selectedTrainings.value = []
  // TODO: 实现状态更新逻辑
}

// 注册快捷键
useShortcuts([
  commonShortcuts.create(handleCreate),
  commonShortcuts.search(focusSearch),
  commonShortcuts.refresh(handleRefresh)
])

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.training-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-header p {
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.search-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.search-bar {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.search-input {
  flex: 1;
}

.filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.material-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
  transition: all var(--transition-normal) var(--ease-out-quart);
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.material-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
  border-color: var(--primary-light);
}

.material-card.selected {
  border-color: var(--primary-color);
  background: var(--selection-bg);
  box-shadow: var(--shadow-focus);
}

.card-selector {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 2;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--transition-fast) var(--ease-out-quart);
}

.material-card:hover .card-selector,
.material-card.selected .card-selector {
  opacity: 1;
  transform: scale(1);
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.card-header h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.card-body {
  padding: var(--spacing-lg);
}

.material-content {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.material-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.material-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.card-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-secondary);
}

.stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .materials-grid {
    grid-template-columns: 1fr;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .card-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .stats {
    justify-content: center;
  }
}
</style>