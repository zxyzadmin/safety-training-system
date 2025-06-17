<template>
  <div class="standards-list">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>标准规范管理</h1>
          <p>管理企业安全标准规范文档，确保规范的及时更新和有效性管理</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showUploadDialog" :icon="Plus">
            新增规范
          </el-button>
          <el-button @click="exportStandards" :icon="Download">
            批量导出
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <el-card>
        <div class="search-form">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索标准名称、编号..."
                :prefix-icon="Search"
                clearable
                @input="handleSearch"
              />
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchForm.category"
                placeholder="标准分类"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部分类" value="" />
                <el-option label="国家标准" value="national" />
                <el-option label="行业标准" value="industry" />
                <el-option label="企业标准" value="enterprise" />
                <el-option label="国际标准" value="international" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchForm.status"
                placeholder="有效状态"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部状态" value="" />
                <el-option label="有效" value="valid" />
                <el-option label="即将过期" value="expiring" />
                <el-option label="已失效" value="expired" />
                <el-option label="草稿" value="draft" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchForm.domain"
                placeholder="适用领域"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部领域" value="" />
                <el-option label="消防安全" value="fire" />
                <el-option label="化学安全" value="chemical" />
                <el-option label="机械安全" value="mechanical" />
                <el-option label="电气安全" value="electrical" />
                <el-option label="环境保护" value="environment" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="发布开始日期"
                end-placeholder="发布结束日期"
                @change="handleSearch"
                style="width: 100%"
              />
            </el-col>
          </el-row>
          
          <div class="search-stats">
            <span class="stats-text">
              共找到 {{ filteredStandards.length }} 个标准规范
            </span>
            <div class="filter-tags">
              <el-tag
                v-for="filter in activeFilters"
                :key="filter.key"
                closable
                @close="removeFilter(filter.key)"
                type="info"
              >
                {{ filter.label }}: {{ filter.value }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 标准列表 -->
    <div class="standards-content">
      <el-card>
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <el-button
              v-if="selectedStandards.length > 0"
              type="danger"
              size="small"
              @click="batchDelete"
              :icon="Delete"
            >
              批量删除 ({{ selectedStandards.length }})
            </el-button>
            <el-button
              v-if="selectedStandards.length > 0"
              size="small"
              @click="batchExport"
              :icon="Download"
            >
              批量导出
            </el-button>
          </div>
          
          <div class="toolbar-right">
            <el-button-group>
              <el-button
                :type="viewMode === 'grid' ? 'primary' : 'default'"
                @click="viewMode = 'grid'"
                :icon="Grid"
                size="small"
              />
              <el-button
                :type="viewMode === 'list' ? 'primary' : 'default'"
                @click="viewMode = 'list'"
                :icon="List"
                size="small"
              />
            </el-button-group>
          </div>
        </div>

        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="standards-grid">
          <div
            v-for="standard in paginatedStandards"
            :key="standard.id"
            class="standard-card"
            :class="{ selected: selectedStandards.includes(standard.id) }"
            @click="viewStandard(standard)"
          >
            <div class="card-header">
              <el-checkbox
                :model-value="selectedStandards.includes(standard.id)"
                @change="toggleSelect(standard.id)"
                @click.stop
              />
              <el-tag :type="getCategoryType(standard.category)" size="small">
                {{ getCategoryText(standard.category) }}
              </el-tag>
              <el-dropdown @command="(cmd) => handleStandardAction(cmd, standard)" trigger="click">
                <el-button type="text" :icon="MoreFilled" @click.stop />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">查看详情</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑规范</el-dropdown-item>
                    <el-dropdown-item command="version">版本管理</el-dropdown-item>
                    <el-dropdown-item command="download">下载文件</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除规范</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <div class="card-body">
              <div class="standard-icon">
                <el-icon><Document /></el-icon>
              </div>
              <h3 class="standard-title">{{ standard.title }}</h3>
              <p class="standard-code">{{ standard.code }}</p>
              <p class="standard-description">{{ standard.description }}</p>
              
              <div class="standard-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(standard.publishDate) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ standard.publisher }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span v-if="standard.expiryDate">
                    {{ getExpiryStatus(standard.expiryDate) }}
                  </span>
                  <span v-else>长期有效</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <el-tag
                :type="getStatusType(standard.status)"
                size="small"
              >
                {{ getStatusText(standard.status) }}
              </el-tag>
              <span class="version">v{{ standard.version }}</span>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="standards-table">
          <el-table
            :data="paginatedStandards"
            @selection-change="handleSelectionChange"
            stripe
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="code" label="标准编号" width="150" />
            <el-table-column prop="title" label="标准名称" min-width="200">
              <template #default="{ row }">
                <el-button type="text" @click="viewStandard(row)">
                  {{ row.title }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="100">
              <template #default="{ row }">
                <el-tag :type="getCategoryType(row.category)" size="small">
                  {{ getCategoryText(row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="domain" label="适用领域" width="120">
              <template #default="{ row }">
                {{ getDomainText(row.domain) }}
              </template>
            </el-table-column>
            <el-table-column prop="publishDate" label="发布日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.publishDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="version" label="版本" width="80">
              <template #default="{ row }">
                v{{ row.version }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="有效期" width="120">
              <template #default="{ row }">
                <span v-if="row.expiryDate" :class="getExpiryClass(row.expiryDate)">
                  {{ formatDate(row.expiryDate) }}
                </span>
                <span v-else class="permanent">长期有效</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="viewStandard(row)">
                  查看
                </el-button>
                <el-button type="text" size="small" @click="editStandard(row)">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="manageVersions(row)">
                  版本
                </el-button>
                <el-button type="text" size="small" @click="downloadStandard(row)">
                  下载
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteStandard(row)"
                  class="danger-text"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="filteredStandards.length"
            :page-sizes="[12, 24, 48, 96]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑规范对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      :title="editingStandard ? '编辑规范' : '新增规范'"
      width="800px"
      :close-on-click-modal="false"
    >
      <StandardsUpload
        :standard="editingStandard"
        @success="handleUploadSuccess"
        @cancel="handleUploadCancel"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Plus,
  Download,
  Delete,
  Grid,
  List,
  MoreFilled,
  Document,
  Calendar,
  User,
  Clock
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import StandardsUpload from './StandardsUpload.vue'

const router = useRouter()
const authStore = useAuthStore()

// 接口定义
interface Standard {
  id: number
  code: string
  title: string
  description: string
  category: string
  domain: string
  publisher: string
  publishDate: string
  expiryDate?: string
  version: string
  status: string
  fileSize: number
  downloadCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 响应式数据
const viewMode = ref<'grid' | 'list'>('grid')
const selectAll = ref(false)
const selectedStandards = ref<number[]>([])
const uploadDialogVisible = ref(false)
const editingStandard = ref<Standard | null>(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  domain: '',
  dateRange: undefined as any
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 12
})

// 模拟标准数据
const standards = ref<Standard[]>([
  {
    id: 1,
    code: 'GB 50016-2014',
    title: '建筑设计防火规范',
    description: '规定建筑设计的防火安全要求，包括总平面布局、建筑分类和耐火等级、总平面布置等。',
    category: 'national',
    domain: 'fire',
    publisher: '中华人民共和国住房和城乡建设部',
    publishDate: '2014-08-27',
    expiryDate: '2024-12-31',
    version: '2014',
    status: 'expiring',
    fileSize: 5242880,
    downloadCount: 234,
    createdBy: 'admin',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 2,
    code: 'AQ 3013-2008',
    title: '危险化学品从业单位安全标准化通用规范',
    description: '规定了危险化学品从业单位安全标准化的基本要求、实施程序和评价标准。',
    category: 'industry',
    domain: 'chemical',
    publisher: '国家安全生产监督管理总局',
    publishDate: '2008-02-18',
    version: '2008',
    status: 'valid',
    fileSize: 3145728,
    downloadCount: 156,
    createdBy: 'admin',
    createdAt: '2024-01-12T10:15:00Z',
    updatedAt: '2024-01-12T10:15:00Z'
  },
  {
    id: 3,
    code: 'Q/ABC-2024-001',
    title: '企业电气安全操作规程',
    description: '本企业电气设备安全操作的详细规程，包括设备检查、操作流程、应急处理等内容。',
    category: 'enterprise',
    domain: 'electrical',
    publisher: '本企业技术部',
    publishDate: '2024-01-01',
    expiryDate: '2026-12-31',
    version: '1.0',
    status: 'valid',
    fileSize: 2097152,
    downloadCount: 89,
    createdBy: 'admin',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-05T16:20:00Z'
  }
])

// 计算属性
const filteredStandards = computed(() => {
  let result = standards.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(standard =>
      standard.title.toLowerCase().includes(keyword) ||
      standard.code.toLowerCase().includes(keyword) ||
      standard.description.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.category) {
    result = result.filter(standard => standard.category === searchForm.category)
  }

  if (searchForm.status) {
    result = result.filter(standard => standard.status === searchForm.status)
  }

  if (searchForm.domain) {
    result = result.filter(standard => standard.domain === searchForm.domain)
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange
    result = result.filter(standard => {
      const publishDate = new Date(standard.publishDate)
      return publishDate >= start && publishDate <= end
    })
  }

  return result
})

const paginatedStandards = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredStandards.value.slice(start, end)
})

const isIndeterminate = computed(() => {
  const selectedCount = selectedStandards.value.length
  const totalCount = paginatedStandards.value.length
  return selectedCount > 0 && selectedCount < totalCount
})

const activeFilters = computed(() => {
  const filters = []
  if (searchForm.category) {
    filters.push({ key: 'category', label: '分类', value: getCategoryText(searchForm.category) })
  }
  if (searchForm.status) {
    filters.push({ key: 'status', label: '状态', value: getStatusText(searchForm.status) })
  }
  if (searchForm.domain) {
    filters.push({ key: 'domain', label: '领域', value: getDomainText(searchForm.domain) })
  }
  return filters
})

// 工具方法
const getCategoryType = (category: string) => {
  const types = {
    national: 'danger',
    industry: 'warning',
    enterprise: 'success',
    international: 'primary'
  }
  return types[category as keyof typeof types] || 'default'
}

const getCategoryText = (category: string) => {
  const texts = {
    national: '国家标准',
    industry: '行业标准',
    enterprise: '企业标准',
    international: '国际标准'
  }
  return texts[category as keyof typeof texts] || category
}

const getStatusType = (status: string) => {
  const types = {
    valid: 'success',
    expiring: 'warning',
    expired: 'danger',
    draft: 'info'
  }
  return types[status as keyof typeof types] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    valid: '有效',
    expiring: '即将过期',
    expired: '已失效',
    draft: '草稿'
  }
  return texts[status as keyof typeof texts] || status
}

const getDomainText = (domain: string) => {
  const texts = {
    fire: '消防安全',
    chemical: '化学安全',
    mechanical: '机械安全',
    electrical: '电气安全',
    environment: '环境保护'
  }
  return texts[domain as keyof typeof texts] || domain
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getExpiryStatus = (expiryDate: string) => {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return '已过期'
  } else if (diffDays <= 30) {
    return `${diffDays}天后过期`
  } else {
    return formatDate(expiryDate)
  }
}

const getExpiryClass = (expiryDate: string) => {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'expired'
  } else if (diffDays <= 30) {
    return 'expiring'
  } else {
    return 'valid'
  }
}

// 事件处理
const handleSearch = () => {
  pagination.page = 1
}

const removeFilter = (key: string) => {
  (searchForm as any)[key] = ''
  handleSearch()
}

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedStandards.value = paginatedStandards.value.map(standard => standard.id)
  } else {
    selectedStandards.value = []
  }
}

const toggleSelect = (id: number) => {
  const index = selectedStandards.value.indexOf(id)
  if (index > -1) {
    selectedStandards.value.splice(index, 1)
  } else {
    selectedStandards.value.push(id)
  }
}

const handleSelectionChange = (selection: Standard[]) => {
  selectedStandards.value = selection.map(item => item.id)
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const showUploadDialog = () => {
  editingStandard.value = null
  uploadDialogVisible.value = true
}

const viewStandard = (standard: Standard) => {
  router.push(`/standards/${standard.id}`)
}

const editStandard = (standard: Standard) => {
  editingStandard.value = standard
  uploadDialogVisible.value = true
}

const manageVersions = (standard: Standard) => {
  router.push(`/standards/${standard.id}/version`)
}

const downloadStandard = (standard: Standard) => {
  ElMessage.success(`正在下载：${standard.title}`)
}

const deleteStandard = (standard: Standard) => {
  ElMessageBox.confirm(
    `确定要删除标准"${standard.title}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = standards.value.findIndex(s => s.id === standard.id)
    if (index > -1) {
      standards.value.splice(index, 1)
      ElMessage.success('标准删除成功')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const handleStandardAction = (command: string, standard: Standard) => {
  switch (command) {
    case 'view':
      viewStandard(standard)
      break
    case 'edit':
      editStandard(standard)
      break
    case 'version':
      manageVersions(standard)
      break
    case 'download':
      downloadStandard(standard)
      break
    case 'delete':
      deleteStandard(standard)
      break
  }
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedStandards.value.length} 个标准吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    standards.value = standards.value.filter(standard => !selectedStandards.value.includes(standard.id))
    selectedStandards.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

const batchExport = () => {
  ElMessage.success(`正在导出 ${selectedStandards.value.length} 个标准`)
}

const exportStandards = () => {
  ElMessage.success('正在导出所有标准')
}

const handleUploadSuccess = () => {
  uploadDialogVisible.value = false
  ElMessage.success(editingStandard.value ? '标准更新成功' : '标准新增成功')
  // 这里应该刷新列表数据
}

const handleUploadCancel = () => {
  uploadDialogVisible.value = false
}

// 组件挂载
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.standards-list {
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
  flex-shrink: 0;
}

.search-section {
  margin-bottom: var(--spacing-xl);
}

.search-form {
  padding: var(--spacing-lg);
}

.search-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.stats-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.filter-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.standards-content {
  margin-bottom: var(--spacing-xl);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.standard-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
  transition: all var(--transition-normal);
  cursor: pointer;
  overflow: hidden;
}

.standard-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.standard-card.selected {
  border-color: var(--primary-color);
  background-color: var(--primary-lighter);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.card-body {
  padding: var(--spacing-lg);
  text-align: center;
}

.standard-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-lighter);
  border-radius: var(--radius-full);
  color: var(--primary-color);
  font-size: 24px;
}

.standard-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.standard-code {
  font-size: var(--font-sm);
  color: var(--primary-color);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-sm);
}

.standard-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.standard-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.version {
  font-size: var(--font-xs);
  color: var(--text-disabled);
  font-family: monospace;
}

.standards-table {
  padding: var(--spacing-lg);
}

.danger-text {
  color: var(--danger-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.expired {
  color: var(--danger-color);
  font-weight: var(--font-medium);
}

.expiring {
  color: var(--warning-color);
  font-weight: var(--font-medium);
}

.valid {
  color: var(--success-color);
}

.permanent {
  color: var(--text-secondary);
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .standards-grid {
    grid-template-columns: 1fr;
    padding: var(--spacing-md);
  }
  
  .toolbar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .search-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }
}

/* 深色主题适配 */
.dark .standard-card {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
}

.dark .standard-card.selected {
  background-color: rgba(30, 136, 229, 0.1);
}

.dark .card-header,
.dark .card-footer {
  background-color: var(--bg-tertiary);
}

.dark .standard-icon {
  background-color: rgba(30, 136, 229, 0.2);
}
</style>