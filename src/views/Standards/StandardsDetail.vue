<template>
  <div class="standards-detail">
    <div class="page-header">
      <div class="header-content">
        <div class="back-button">
          <el-button @click="goBack" :icon="ArrowLeft">
            返回列表
          </el-button>
        </div>
        <div class="header-actions">
          <el-button @click="editStandard" :icon="Edit">
            编辑规范
          </el-button>
          <el-button @click="downloadStandard" :icon="Download">
            下载文档
          </el-button>
          <el-dropdown @command="handleAction" trigger="click">
            <el-button :icon="MoreFilled">
              更多操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="version">版本管理</el-dropdown-item>
                <el-dropdown-item command="share">分享规范</el-dropdown-item>
                <el-dropdown-item command="export">导出PDF</el-dropdown-item>
                <el-dropdown-item command="print">打印文档</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除规范</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="detail-content" v-if="standard">
      <el-row :gutter="24">
        <!-- 主要信息 -->
        <el-col :span="16">
          <el-card class="main-card">
            <!-- 标准头部 -->
            <div class="standard-header">
              <div class="header-left">
                <div class="standard-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="standard-info">
                  <h1 class="standard-title">{{ standard.title }}</h1>
                  <div class="standard-meta">
                    <el-tag :type="getCategoryType(standard.category)" size="large">
                      {{ getCategoryText(standard.category) }}
                    </el-tag>
                    <span class="standard-code">{{ standard.code }}</span>
                    <span class="version">v{{ standard.version }}</span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <el-tag :type="getStatusType(standard.status)" size="large">
                  {{ getStatusText(standard.status) }}
                </el-tag>
              </div>
            </div>

            <!-- 标准描述 -->
            <div class="standard-description">
              <h3>标准描述</h3>
              <p>{{ standard.description }}</p>
            </div>

            <!-- 详细信息 -->
            <div class="standard-details">
              <h3>详细信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="标准编号">
                  {{ standard.code }}
                </el-descriptions-item>
                <el-descriptions-item label="版本号">
                  v{{ standard.version }}
                </el-descriptions-item>
                <el-descriptions-item label="标准分类">
                  <el-tag :type="getCategoryType(standard.category)">
                    {{ getCategoryText(standard.category) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="适用领域">
                  {{ getDomainText(standard.domain) }}
                </el-descriptions-item>
                <el-descriptions-item label="发布机构">
                  {{ standard.publisher }}
                </el-descriptions-item>
                <el-descriptions-item label="发布日期">
                  {{ formatDate(standard.publishDate) }}
                </el-descriptions-item>
                <el-descriptions-item label="生效日期">
                  {{ formatDate(standard.effectiveDate) }}
                </el-descriptions-item>
                <el-descriptions-item label="有效期">
                  <span v-if="standard.expiryDate" :class="getExpiryClass(standard.expiryDate)">
                    {{ formatDate(standard.expiryDate) }}
                    <small>({{ getExpiryStatus(standard.expiryDate) }})</small>
                  </span>
                  <span v-else class="permanent">长期有效</span>
                </el-descriptions-item>
                <el-descriptions-item label="文件大小">
                  {{ formatFileSize(standard.fileSize) }}
                </el-descriptions-item>
                <el-descriptions-item label="下载次数">
                  {{ standard.downloadCount }} 次
                </el-descriptions-item>
                <el-descriptions-item label="创建者">
                  {{ standard.createdBy }}
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  {{ formatDateTime(standard.createdAt) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 文档预览 -->
            <div class="document-preview">
              <h3>文档预览</h3>
              <div class="preview-container">
                <div class="preview-placeholder">
                  <el-icon class="preview-icon"><Document /></el-icon>
                  <p>{{ getFileName(standard.code) }}</p>
                  <div class="preview-actions">
                    <el-button type="primary" @click="viewDocument">
                      在线预览
                    </el-button>
                    <el-button @click="downloadStandard">
                      下载文档
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 侧边栏信息 -->
        <el-col :span="8">
          <!-- 快速信息 -->
          <el-card class="sidebar-card">
            <template #header>
              <span>快速信息</span>
            </template>
            <div class="quick-info">
              <div class="info-item">
                <el-icon class="info-icon"><Calendar /></el-icon>
                <div class="info-content">
                  <div class="info-label">发布时间</div>
                  <div class="info-value">{{ formatDate(standard.publishDate) }}</div>
                </div>
              </div>
              <div class="info-item">
                <el-icon class="info-icon"><Clock /></el-icon>
                <div class="info-content">
                  <div class="info-label">有效状态</div>
                  <div class="info-value">
                    <el-tag :type="getStatusType(standard.status)" size="small">
                      {{ getStatusText(standard.status) }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div class="info-item">
                <el-icon class="info-icon"><Download /></el-icon>
                <div class="info-content">
                  <div class="info-label">下载统计</div>
                  <div class="info-value">{{ standard.downloadCount }} 次</div>
                </div>
              </div>
              <div class="info-item">
                <el-icon class="info-icon"><User /></el-icon>
                <div class="info-content">
                  <div class="info-label">创建者</div>
                  <div class="info-value">{{ standard.createdBy }}</div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 版本历史 -->
          <el-card class="sidebar-card">
            <template #header>
              <span>版本历史</span>
            </template>
            <div class="version-history">
              <el-timeline size="small">
                <el-timeline-item
                  v-for="version in versionHistory"
                  :key="version.id"
                  :timestamp="formatDate(version.createdAt)"
                  :type="getVersionType(version.updateType)"
                >
                  <div class="version-content">
                    <div class="version-header">
                      <strong>v{{ version.version }}</strong>
                      <el-tag :type="getVersionTagType(version.updateType)" size="small">
                        {{ getVersionText(version.updateType) }}
                      </el-tag>
                    </div>
                    <div class="version-notes">{{ version.updateNotes }}</div>
                    <div class="version-author">{{ version.createdBy }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>

          <!-- 相关标准 -->
          <el-card class="sidebar-card">
            <template #header>
              <span>相关标准</span>
            </template>
            <div class="related-standards">
              <div
                v-for="related in relatedStandards"
                :key="related.id"
                class="related-item"
                @click="viewRelated(related)"
              >
                <div class="related-info">
                  <div class="related-title">{{ related.title }}</div>
                  <div class="related-code">{{ related.code }}</div>
                </div>
                <el-icon class="related-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>

          <!-- 操作记录 -->
          <el-card class="sidebar-card">
            <template #header>
              <span>最近操作</span>
            </template>
            <div class="operation-log">
              <div
                v-for="log in operationLogs"
                :key="log.id"
                class="log-item"
              >
                <div class="log-content">
                  <div class="log-action">{{ log.action }}</div>
                  <div class="log-time">{{ formatDateTime(log.createdAt) }}</div>
                </div>
                <div class="log-user">{{ log.user }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-container" v-loading="loading" element-loading-text="加载中...">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Edit,
  Download,
  MoreFilled,
  Document,
  Calendar,
  Clock,
  User
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const standard = ref(null as any)

// 版本历史数据
const versionHistory = ref([
  {
    id: 1,
    version: '2014',
    updateType: 'major',
    updateNotes: '初始版本发布，建立了完整的建筑防火设计规范体系。',
    createdBy: '标准委员会',
    createdAt: '2014-08-27'
  },
  {
    id: 2,
    version: '2014.1',
    updateType: 'patch',
    updateNotes: '修正了第3.2.5条款中的计算公式错误。',
    createdBy: '技术组',
    createdAt: '2015-03-15'
  }
])

// 相关标准数据
const relatedStandards = ref([
  {
    id: 2,
    title: '建筑材料燃烧性能分级',
    code: 'GB 8624-2012'
  },
  {
    id: 3,
    title: '火灾自动报警系统设计规范',
    code: 'GB 50116-2013'
  },
  {
    id: 4,
    title: '自动喷水灭火系统设计规范',
    code: 'GB 50084-2017'
  }
])

// 操作记录数据
const operationLogs = ref([
  {
    id: 1,
    action: '下载文档',
    user: '张三',
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 2,
    action: '查看详情',
    user: '李四',
    createdAt: '2024-01-15T10:15:00Z'
  },
  {
    id: 3,
    action: '编辑规范',
    user: 'admin',
    createdAt: '2024-01-14T16:20:00Z'
  }
])

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

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
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
    return '有效'
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

const getVersionType = (updateType: string) => {
  const types = {
    major: 'primary',
    minor: 'success',
    patch: 'warning'
  }
  return types[updateType as keyof typeof types] || 'primary'
}

const getVersionTagType = (updateType: string) => {
  const types = {
    major: 'danger',
    minor: 'success',
    patch: 'warning'
  }
  return types[updateType as keyof typeof types] || 'info'
}

const getVersionText = (updateType: string) => {
  const texts = {
    major: '大版本',
    minor: '小版本',
    patch: '补丁'
  }
  return texts[updateType as keyof typeof texts] || updateType
}

const getFileName = (code: string) => {
  return `${code}.pdf`
}

// 事件处理
const goBack = () => {
  router.push('/standards')
}

const editStandard = () => {
  router.push(`/standards/${standard.value.id}/edit`)
}

const downloadStandard = () => {
  ElMessage.success(`正在下载：${standard.value.title}`)
  // 增加下载次数
  standard.value.downloadCount++
}

const viewDocument = () => {
  ElMessage.info('正在启动文档预览...')
}

const handleAction = (command: string) => {
  switch (command) {
    case 'version':
      router.push(`/standards/${standard.value.id}/version`)
      break
    case 'share':
      ElMessage.success('分享链接已复制到剪贴板')
      break
    case 'export':
      ElMessage.success('正在导出PDF...')
      break
    case 'print':
      window.print()
      break
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除标准"${standard.value.title}"吗？此操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('标准删除成功')
        router.push('/standards')
      }).catch(() => {
        // 用户取消删除
      })
      break
  }
}

const viewRelated = (related: any) => {
  router.push(`/standards/${related.id}`)
}

// 初始化数据
const loadStandardDetail = () => {
  loading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    standard.value = {
      id: parseInt(route.params.id as string),
      code: 'GB 50016-2014',
      title: '建筑设计防火规范',
      description: '本规范规定了建筑设计的防火安全要求，包括总平面布局、建筑分类和耐火等级、总平面布置、平面布置、防火分区和防火分隔、安全疏散、建筑构造、消防设施等内容。本规范适用于新建、扩建和改建的民用建筑和工业建筑的防火设计。',
      category: 'national',
      domain: 'fire',
      publisher: '中华人民共和国住房和城乡建设部',
      publishDate: '2014-08-27',
      effectiveDate: '2015-05-01',
      expiryDate: '2024-12-31',
      version: '2014',
      status: 'expiring',
      fileSize: 5242880,
      downloadCount: 234,
      createdBy: 'admin',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z'
    }
    loading.value = false
  }, 800)
}

onMounted(() => {
  loadStandardDetail()
})
</script>

<style scoped>
.standards-detail {
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

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.detail-content {
  margin-bottom: var(--spacing-xl);
}

.main-card {
  margin-bottom: var(--spacing-lg);
}

.sidebar-card {
  margin-bottom: var(--spacing-lg);
}

.standard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  gap: var(--spacing-lg);
  flex: 1;
}

.standard-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-lighter);
  border-radius: var(--radius-lg);
  color: var(--primary-color);
  font-size: 32px;
  flex-shrink: 0;
}

.standard-info {
  flex: 1;
}

.standard-title {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
}

.standard-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.standard-code {
  font-size: var(--font-lg);
  color: var(--primary-color);
  font-weight: var(--font-semibold);
  font-family: monospace;
}

.version {
  font-size: var(--font-md);
  color: var(--text-secondary);
  font-family: monospace;
}

.standard-description {
  margin-bottom: var(--spacing-xl);
}

.standard-description h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.standard-description p {
  font-size: var(--font-md);
  color: var(--text-secondary);
  line-height: 1.8;
}

.standard-details {
  margin-bottom: var(--spacing-xl);
}

.standard-details h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.document-preview h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.preview-container {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.preview-icon {
  font-size: 48px;
  color: var(--text-disabled);
  margin-bottom: var(--spacing-md);
}

.preview-placeholder p {
  font-size: var(--font-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.preview-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.info-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-lighter);
  border-radius: var(--radius-md);
  color: var(--primary-color);
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.info-value {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.version-history {
  max-height: 300px;
  overflow-y: auto;
}

.version-content {
  padding-bottom: var(--spacing-md);
}

.version-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.version-notes {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-sm);
}

.version-author {
  font-size: var(--font-xs);
  color: var(--text-disabled);
}

.related-standards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.related-item:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-lighter);
}

.related-info {
  flex: 1;
}

.related-title {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-xs);
}

.related-code {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  font-family: monospace;
}

.related-arrow {
  color: var(--text-disabled);
  transition: all var(--transition-normal);
}

.related-item:hover .related-arrow {
  color: var(--primary-color);
  transform: translateX(2px);
}

.operation-log {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
}

.log-content {
  flex: 1;
}

.log-action {
  font-size: var(--font-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.log-time {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.log-user {
  font-size: var(--font-xs);
  color: var(--text-disabled);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
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
    gap: var(--spacing-md);
  }
  
  .standard-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .header-left {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .standard-meta {
    justify-content: flex-start;
  }
  
  .preview-actions {
    flex-direction: column;
  }
}

/* 深色主题适配 */
.dark .preview-container {
  background-color: var(--bg-tertiary);
  border-color: var(--border-medium);
}

.dark .related-item {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
}

.dark .related-item:hover {
  background-color: rgba(30, 136, 229, 0.1);
}

.dark .log-item {
  background-color: var(--bg-tertiary);
}

.dark .info-icon {
  background-color: rgba(30, 136, 229, 0.2);
}

.dark .standard-icon {
  background-color: rgba(30, 136, 229, 0.2);
}
</style>