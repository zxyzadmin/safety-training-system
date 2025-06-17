<template>
  <div class="archive-list">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>档案归集管理</h1>
          <p>统一管理和维护企业安全培训档案，确保档案的完整性和可追溯性</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog" :icon="Plus">
            新建档案
          </el-button>
          <el-button @click="exportArchives" :icon="Download">
            批量导出
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <el-card>
        <div class="search-form">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索档案标题、编号..."
                :prefix-icon="Search"
                clearable
                @input="handleSearch"
              />
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchForm.category"
                placeholder="档案分类"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部分类" value="" />
                <el-option label="培训档案" value="training" />
                <el-option label="考核档案" value="assessment" />
                <el-option label="证书档案" value="certificate" />
                <el-option label="事故档案" value="incident" />
                <el-option label="检查档案" value="inspection" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchForm.department"
                placeholder="所属部门"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部部门" value="" />
                <el-option label="安全科" value="安全科" />
                <el-option label="生产部" value="生产部" />
                <el-option label="技术部" value="技术部" />
                <el-option label="人事部" value="人事部" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchForm.status"
                placeholder="档案状态"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部状态" value="" />
                <el-option label="归档中" value="archiving" />
                <el-option label="已归档" value="archived" />
                <el-option label="待审核" value="pending" />
                <el-option label="已过期" value="expired" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleSearch"
                style="width: 100%"
              />
            </el-col>
          </el-row>
          
          <div class="advanced-search" v-if="showAdvancedSearch">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-input
                  v-model="searchForm.archiveNumber"
                  placeholder="档案编号"
                  clearable
                />
              </el-col>
              <el-col :span="6">
                <el-input
                  v-model="searchForm.createdBy"
                  placeholder="创建人"
                  clearable
                />
              </el-col>
              <el-col :span="6">
                <el-select
                  v-model="searchForm.urgency"
                  placeholder="紧急程度"
                  clearable
                >
                  <el-option label="一般" value="normal" />
                  <el-option label="重要" value="important" />
                  <el-option label="紧急" value="urgent" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="handleSearch">
                  搜索
                </el-button>
                <el-button @click="resetSearch">
                  重置
                </el-button>
              </el-col>
            </el-row>
          </div>
          
          <div class="search-actions">
            <el-button
              type="text"
              @click="showAdvancedSearch = !showAdvancedSearch"
              :icon="showAdvancedSearch ? ArrowUp : ArrowDown"
            >
              {{ showAdvancedSearch ? '收起' : '高级搜索' }}
            </el-button>
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

    <!-- 档案列表 -->
    <div class="archive-content">
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
              v-if="selectedArchives.length > 0"
              type="danger"
              size="small"
              @click="batchDelete"
              :icon="Delete"
            >
              批量删除 ({{ selectedArchives.length }})
            </el-button>
            <el-button
              v-if="selectedArchives.length > 0"
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
            
            <el-dropdown @command="handleSort">
              <el-button size="small" :icon="Sort">
                排序 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="createdAt-desc">创建时间 ↓</el-dropdown-item>
                  <el-dropdown-item command="createdAt-asc">创建时间 ↑</el-dropdown-item>
                  <el-dropdown-item command="title-asc">标题 A-Z</el-dropdown-item>
                  <el-dropdown-item command="title-desc">标题 Z-A</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="archive-grid">
          <div
            v-for="archive in paginatedArchives"
            :key="archive.id"
            class="archive-card"
            :class="{ selected: selectedArchives.includes(archive.id) }"
            @click="viewArchive(archive)"
          >
            <div class="card-header">
              <el-checkbox
                :model-value="selectedArchives.includes(archive.id)"
                @change="toggleSelect(archive.id)"
                @click.stop
              />
              <el-tag :type="getCategoryType(archive.category)" size="small">
                {{ getCategoryText(archive.category) }}
              </el-tag>
              <el-dropdown @command="(cmd) => handleArchiveAction(cmd, archive)" trigger="click">
                <el-button type="text" :icon="MoreFilled" @click.stop />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">查看详情</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑档案</el-dropdown-item>
                    <el-dropdown-item command="download">下载文件</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除档案</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <div class="card-body">
              <div class="archive-icon">
                <el-icon><FolderOpened /></el-icon>
              </div>
              <h3 class="archive-title">{{ archive.title }}</h3>
              <p class="archive-description">{{ archive.description }}</p>
              
              <div class="archive-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(archive.createdAt) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ archive.createdBy }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Files /></el-icon>
                  <span>{{ archive.fileCount }} 个文件</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <el-tag
                :type="getStatusType(archive.status)"
                size="small"
              >
                {{ getStatusText(archive.status) }}
              </el-tag>
              <span class="archive-number">{{ archive.archiveNumber }}</span>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="archive-table">
          <el-table
            :data="paginatedArchives"
            @selection-change="handleSelectionChange"
            stripe
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="archiveNumber" label="档案编号" width="120" />
            <el-table-column prop="title" label="档案标题" min-width="200">
              <template #default="{ row }">
                <el-button type="text" @click="viewArchive(row)">
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
            <el-table-column prop="department" label="部门" width="120" />
            <el-table-column prop="createdBy" label="创建人" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="viewArchive(row)">
                  查看
                </el-button>
                <el-button type="text" size="small" @click="editArchive(row)">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="downloadArchive(row)">
                  下载
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteArchive(row)"
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
            :total="filteredArchives.length"
            :page-sizes="[12, 24, 48, 96]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新建档案对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建档案"
      width="600px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="档案标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入档案标题" />
        </el-form-item>
        <el-form-item label="档案分类" prop="category">
          <el-select v-model="createForm.category" placeholder="请选择档案分类">
            <el-option label="培训档案" value="training" />
            <el-option label="考核档案" value="assessment" />
            <el-option label="证书档案" value="certificate" />
            <el-option label="事故档案" value="incident" />
            <el-option label="检查档案" value="inspection" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="createForm.department" placeholder="请选择部门">
            <el-option label="安全科" value="安全科" />
            <el-option label="生产部" value="生产部" />
            <el-option label="技术部" value="技术部" />
            <el-option label="人事部" value="人事部" />
          </el-select>
        </el-form-item>
        <el-form-item label="档案描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入档案描述"
          />
        </el-form-item>
        <el-form-item label="紧急程度" prop="urgency">
          <el-radio-group v-model="createForm.urgency">
            <el-radio label="normal">一般</el-radio>
            <el-radio label="important">重要</el-radio>
            <el-radio label="urgent">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createArchive" :loading="creating">
          创建
        </el-button>
      </template>
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
  Sort,
  ArrowUp,
  ArrowDown,
  MoreFilled,
  FolderOpened,
  Calendar,
  User,
  Files
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// 接口定义
interface Archive {
  id: number
  archiveNumber: string
  title: string
  description: string
  category: string
  department: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  status: string
  urgency: string
  fileCount: number
  tags: string[]
}

// 响应式数据
const viewMode = ref<'grid' | 'list'>('grid')
const showAdvancedSearch = ref(false)
const selectAll = ref(false)
const selectedArchives = ref<number[]>([])
const createDialogVisible = ref(false)
const creating = ref(false)

// 表单引用
const createFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  department: '',
  status: '',
  dateRange: undefined as any,
  archiveNumber: '',
  createdBy: '',
  urgency: ''
})

// 新建表单
const createForm = reactive({
  title: '',
  category: '',
  department: '',
  description: '',
  urgency: 'normal'
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 12
})

// 表单验证规则
const createRules: FormRules = {
  title: [
    { required: true, message: '请输入档案标题', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择档案分类', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入档案描述', trigger: 'blur' }
  ]
}

// 模拟档案数据
const archives = ref<Archive[]>([
  {
    id: 1,
    archiveNumber: 'ARC-2024-001',
    title: '2024年第一季度安全培训档案',
    description: '包含本季度所有安全培训的完整记录，包括培训计划、实施过程、考核结果等。',
    category: 'training',
    department: '安全科',
    createdBy: '张安全',
    createdAt: '2024-01-15T09:00:00Z',
    status: 'archived',
    urgency: 'important',
    fileCount: 15,
    tags: ['季度总结', '安全培训']
  },
  {
    id: 2,
    archiveNumber: 'ARC-2024-002',
    title: '消防安全检查记录档案',
    description: '2024年消防安全检查的详细记录，包括检查表单、整改措施、复查结果。',
    category: 'inspection',
    department: '安全科',
    createdBy: '李检查',
    createdAt: '2024-01-20T14:30:00Z',
    status: 'pending',
    urgency: 'urgent',
    fileCount: 8,
    tags: ['消防安全', '检查记录']
  },
  {
    id: 3,
    archiveNumber: 'ARC-2024-003',
    title: '员工安全资格证书档案',
    description: '收录全体员工的安全资格证书及相关培训证明文件。',
    category: 'certificate',
    department: '人事部',
    createdBy: '王人事',
    createdAt: '2024-02-01T10:15:00Z',
    status: 'archiving',
    urgency: 'normal',
    fileCount: 52,
    tags: ['资格证书', '员工档案']
  }
])

// 计算属性
const filteredArchives = computed(() => {
  let result = archives.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(archive =>
      archive.title.toLowerCase().includes(keyword) ||
      archive.archiveNumber.toLowerCase().includes(keyword) ||
      archive.description.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.category) {
    result = result.filter(archive => archive.category === searchForm.category)
  }

  if (searchForm.department) {
    result = result.filter(archive => archive.department === searchForm.department)
  }

  if (searchForm.status) {
    result = result.filter(archive => archive.status === searchForm.status)
  }

  if (searchForm.archiveNumber) {
    result = result.filter(archive =>
      archive.archiveNumber.toLowerCase().includes(searchForm.archiveNumber.toLowerCase())
    )
  }

  if (searchForm.createdBy) {
    result = result.filter(archive =>
      archive.createdBy.toLowerCase().includes(searchForm.createdBy.toLowerCase())
    )
  }

  if (searchForm.urgency) {
    result = result.filter(archive => archive.urgency === searchForm.urgency)
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange
    result = result.filter(archive => {
      const archiveDate = new Date(archive.createdAt)
      return archiveDate >= start && archiveDate <= end
    })
  }

  return result
})

const paginatedArchives = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredArchives.value.slice(start, end)
})

const isIndeterminate = computed(() => {
  const selectedCount = selectedArchives.value.length
  const totalCount = paginatedArchives.value.length
  return selectedCount > 0 && selectedCount < totalCount
})

const activeFilters = computed(() => {
  const filters = []
  if (searchForm.category) {
    filters.push({ key: 'category', label: '分类', value: getCategoryText(searchForm.category) })
  }
  if (searchForm.department) {
    filters.push({ key: 'department', label: '部门', value: searchForm.department })
  }
  if (searchForm.status) {
    filters.push({ key: 'status', label: '状态', value: getStatusText(searchForm.status) })
  }
  return filters
})

// 工具方法
const getCategoryType = (category: string) => {
  const types = {
    training: 'primary',
    assessment: 'success',
    certificate: 'warning',
    incident: 'danger',
    inspection: 'info'
  }
  return types[category as keyof typeof types] || 'default'
}

const getCategoryText = (category: string) => {
  const texts = {
    training: '培训档案',
    assessment: '考核档案',
    certificate: '证书档案',
    incident: '事故档案',
    inspection: '检查档案'
  }
  return texts[category as keyof typeof texts] || category
}

const getStatusType = (status: string) => {
  const types = {
    archiving: 'warning',
    archived: 'success',
    pending: 'info',
    expired: 'danger'
  }
  return types[status as keyof typeof types] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    archiving: '归档中',
    archived: '已归档',
    pending: '待审核',
    expired: '已过期'
  }
  return texts[status as keyof typeof texts] || status
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 事件处理
const handleSearch = () => {
  pagination.page = 1
}

const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    category: '',
    department: '',
    status: '',
    dateRange: undefined,
    archiveNumber: '',
    createdBy: '',
    urgency: ''
  })
  handleSearch()
}

const removeFilter = (key: string) => {
  (searchForm as any)[key] = ''
  handleSearch()
}

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedArchives.value = paginatedArchives.value.map(archive => archive.id)
  } else {
    selectedArchives.value = []
  }
}

const toggleSelect = (id: number) => {
  const index = selectedArchives.value.indexOf(id)
  if (index > -1) {
    selectedArchives.value.splice(index, 1)
  } else {
    selectedArchives.value.push(id)
  }
}

const handleSelectionChange = (selection: Archive[]) => {
  selectedArchives.value = selection.map(item => item.id)
}

const handleSort = (command: string) => {
  const [field, order] = command.split('-')
  // TODO: 实现排序逻辑
  ElMessage.info(`按${field}${order === 'asc' ? '升序' : '降序'}排序`)
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const showCreateDialog = () => {
  createDialogVisible.value = true
}

const createArchive = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    creating.value = true

    // 模拟创建过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newArchive: Archive = {
      id: Date.now(),
      archiveNumber: `ARC-${new Date().getFullYear()}-${String(archives.value.length + 1).padStart(3, '0')}`,
      ...createForm,
      createdBy: authStore.currentUser?.name || '',
      createdAt: new Date().toISOString(),
      status: 'archiving',
      fileCount: 0,
      tags: []
    }

    archives.value.unshift(newArchive)
    ElMessage.success('档案创建成功')
    createDialogVisible.value = false

    // 重置表单
    Object.assign(createForm, {
      title: '',
      category: '',
      department: '',
      description: '',
      urgency: 'normal'
    })

  } catch (error) {
    ElMessage.error('请完善档案信息')
  } finally {
    creating.value = false
  }
}

const viewArchive = (archive: Archive) => {
  ElMessage.info(`查看档案：${archive.title}`)
  // TODO: 跳转到档案详情页
}

const editArchive = (archive: Archive) => {
  ElMessage.info(`编辑档案：${archive.title}`)
  // TODO: 跳转到档案编辑页
}

const downloadArchive = (archive: Archive) => {
  ElMessage.success(`正在下载档案：${archive.title}`)
}

const deleteArchive = (archive: Archive) => {
  ElMessageBox.confirm(
    `确定要删除档案"${archive.title}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = archives.value.findIndex(a => a.id === archive.id)
    if (index > -1) {
      archives.value.splice(index, 1)
      ElMessage.success('档案删除成功')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const handleArchiveAction = (command: string, archive: Archive) => {
  switch (command) {
    case 'view':
      viewArchive(archive)
      break
    case 'edit':
      editArchive(archive)
      break
    case 'download':
      downloadArchive(archive)
      break
    case 'delete':
      deleteArchive(archive)
      break
  }
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedArchives.value.length} 个档案吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    archives.value = archives.value.filter(archive => !selectedArchives.value.includes(archive.id))
    selectedArchives.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

const batchExport = () => {
  ElMessage.success(`正在导出 ${selectedArchives.value.length} 个档案`)
}

const exportArchives = () => {
  ElMessage.success('正在导出所有档案')
}

// 组件挂载
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.archive-list {
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

.advanced-search {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.search-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
}

.filter-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.archive-content {
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

.archive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.archive-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
  transition: all var(--transition-normal);
  cursor: pointer;
  overflow: hidden;
}

.archive-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.archive-card.selected {
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

.archive-icon {
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

.archive-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.archive-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.archive-meta {
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

.archive-number {
  font-size: var(--font-xs);
  color: var(--text-disabled);
  font-family: monospace;
}

.archive-table {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .archive-grid {
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
}

/* 深色主题适配 */
.dark .archive-card {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
}

.dark .archive-card.selected {
  background-color: rgba(30, 136, 229, 0.1);
}

.dark .card-header,
.dark .card-footer {
  background-color: var(--bg-tertiary);
}

.dark .archive-icon {
  background-color: rgba(30, 136, 229, 0.2);
}
</style>