<template>
  <div class="training-detail">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ materialData?.title || '培训资料详情' }}</h1>
          <div class="meta-info">
            <el-tag :type="getStatusType(materialData?.status)">
              {{ getStatusText(materialData?.status) }}
            </el-tag>
            <span class="divider">|</span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(materialData?.createdAt) }}
            </span>
            <span class="divider">|</span>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ materialData?.instructor }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="goBack" :icon="ArrowLeft">
            返回列表
          </el-button>
          <el-button
            v-if="canEdit"
            type="primary"
            @click="editMaterial"
            :icon="Edit"
          >
            编辑
          </el-button>
          <el-button
            v-if="canApprove"
            type="success"
            @click="showApprovalDialog"
            :icon="Check"
          >
            审批
          </el-button>
        </div>
      </div>
    </div>

    <div class="detail-container">
      <el-row :gutter="24">
        <!-- 左侧主内容 -->
        <el-col :span="16">
          <!-- 基本信息 -->
          <el-card class="info-card" shadow="hover">
            <template #header>
              <h3>基本信息</h3>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="培训主题">
                {{ materialData?.topic }}
              </el-descriptions-item>
              <el-descriptions-item label="培训课时">
                {{ materialData?.duration }} 课时
              </el-descriptions-item>
              <el-descriptions-item label="所属部门">
                {{ materialData?.department }}
              </el-descriptions-item>
              <el-descriptions-item label="上传者">
                {{ materialData?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="关键标签" :span="2">
                <el-tag
                  v-for="tag in materialData?.tags"
                  :key="tag"
                  style="margin-right: 8px"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="资料描述" :span="2">
                <div class="description-content">
                  {{ materialData?.content }}
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 文件信息 -->
          <el-card class="file-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>培训文件</h3>
                <div class="file-stats">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ materialData?.viewCount || 0 }} 次查看
                  </span>
                  <span class="stat-item">
                    <el-icon><Download /></el-icon>
                    {{ materialData?.downloadCount || 0 }} 次下载
                  </span>
                </div>
              </div>
            </template>
            
            <div class="file-section">
              <div class="file-item">
                <div class="file-info">
                  <div class="file-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="file-details">
                    <div class="file-name">{{ materialData?.filename }}</div>
                    <div class="file-meta">
                      <span>{{ formatFileSize(materialData?.fileSize) }}</span>
                      <span class="divider">|</span>
                      <span>{{ materialData?.fileType?.toUpperCase() }}</span>
                    </div>
                  </div>
                </div>
                <div class="file-actions">
                  <el-button
                    type="primary"
                    @click="previewFile"
                    :icon="View"
                  >
                    预览
                  </el-button>
                  <el-button
                    @click="downloadFile"
                    :icon="Download"
                  >
                    下载
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 审批记录 -->
          <el-card v-if="approvalRecords.length > 0" class="approval-card" shadow="hover">
            <template #header>
              <h3>审批记录</h3>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="record in approvalRecords"
                :key="record.id"
                :timestamp="formatDateTime(record.createdAt)"
                :type="getTimelineType(record.action)"
              >
                <div class="timeline-content">
                  <div class="timeline-header">
                    <strong>{{ record.approver }}</strong>
                    <el-tag
                      :type="getActionType(record.action)"
                      size="small"
                    >
                      {{ getActionText(record.action) }}
                    </el-tag>
                  </div>
                  <div class="timeline-comment">
                    {{ record.comment }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>

        <!-- 右侧侧边栏 -->
        <el-col :span="8">
          <!-- 操作面板 -->
          <el-card class="action-panel" shadow="hover">
            <template #header>
              <h3>快速操作</h3>
            </template>
            <div class="action-list">
              <el-button
                class="action-btn"
                type="primary"
                @click="downloadFile"
                :icon="Download"
                plain
              >
                下载文件
              </el-button>
              <el-button
                class="action-btn"
                @click="shareFile"
                :icon="Share"
                plain
              >
                分享链接
              </el-button>
              <el-button
                v-if="canEdit"
                class="action-btn"
                @click="editMaterial"
                :icon="Edit"
                plain
              >
                编辑资料
              </el-button>
              <el-button
                class="action-btn"
                @click="addToFavorites"
                :icon="Star"
                plain
              >
                收藏
              </el-button>
              <el-button
                class="action-btn"
                @click="reportIssue"
                :icon="Warning"
                plain
              >
                举报问题
              </el-button>
            </div>
          </el-card>

          <!-- 统计信息 -->
          <el-card class="stats-panel" shadow="hover">
            <template #header>
              <h3>统计信息</h3>
            </template>
            <div class="stats-list">
              <div class="stat-row">
                <span class="stat-label">查看次数</span>
                <span class="stat-value">{{ materialData?.viewCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">下载次数</span>
                <span class="stat-value">{{ materialData?.downloadCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">创建时间</span>
                <span class="stat-value">{{ formatDate(materialData?.createdAt) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">最后更新</span>
                <span class="stat-value">{{ formatDate(materialData?.updatedAt) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 相关推荐 -->
          <el-card class="recommend-panel" shadow="hover">
            <template #header>
              <h3>相关推荐</h3>
            </template>
            <div class="recommend-list">
              <div
                v-for="item in recommendedMaterials"
                :key="item.id"
                class="recommend-item"
                @click="viewMaterial(item.id)"
              >
                <div class="recommend-title">{{ item.title }}</div>
                <div class="recommend-meta">
                  <span>{{ item.topic }}</span>
                  <span class="divider">|</span>
                  <span>{{ item.duration }}课时</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      title="审批培训资料"
      width="500px"
    >
      <el-form
        ref="approvalFormRef"
        :model="approvalForm"
        :rules="approvalRules"
        label-width="80px"
      >
        <el-form-item label="审批结果" prop="action">
          <el-radio-group v-model="approvalForm.action">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitApproval"
          :loading="approvalSubmitting"
        >
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Edit,
  Check,
  Calendar,
  User,
  View,
  Download,
  Document,
  Share,
  Star,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import type { TrainingMaterial, ApprovalComment } from '@/types/common'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const materialData = ref<TrainingMaterial | null>(null)
const approvalRecords = ref<ApprovalComment[]>([])
const recommendedMaterials = ref<TrainingMaterial[]>([])
const approvalDialogVisible = ref(false)
const approvalSubmitting = ref(false)

// 表单引用
const approvalFormRef = ref<FormInstance>()

// 审批表单
const approvalForm = reactive({
  action: 'approve',
  comment: ''
})

// 审批表单验证规则
const approvalRules: FormRules = {
  action: [
    { required: true, message: '请选择审批结果', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入审批意见', trigger: 'blur' },
    { min: 5, max: 200, message: '审批意见长度在 5 到 200 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const canEdit = computed(() => {
  return authStore.isAdmin || materialData.value?.username === authStore.currentUser?.username
})

const canApprove = computed(() => {
  return authStore.isAdmin && materialData.value?.status === 'pending'
})

// 工具方法
const getStatusType = (status?: string) => {
  const types = {
    draft: 'info',
    pending: 'warning', 
    approved: 'success',
    rejected: 'danger'
  }
  return types[status as keyof typeof types] || 'info'
}

const getStatusText = (status?: string) => {
  const texts = {
    draft: '草稿',
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status as keyof typeof texts] || status
}

const getActionType = (action: string) => {
  const types = {
    approve: 'success',
    reject: 'danger',
    comment: 'info'
  }
  return types[action as keyof typeof types] || 'info'
}

const getActionText = (action: string) => {
  const texts = {
    approve: '通过',
    reject: '拒绝',
    comment: '评论'
  }
  return texts[action as keyof typeof texts] || action
}

const getTimelineType = (action: string) => {
  const types = {
    approve: 'success',
    reject: 'danger',
    comment: 'primary'
  }
  return types[action as keyof typeof types] || 'primary'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatFileSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

// 事件处理
const goBack = () => {
  router.push('/training')
}

const editMaterial = () => {
  router.push(`/training/upload?id=${materialData.value?.id}`)
}

const previewFile = () => {
  ElMessage.info('文件预览功能开发中')
}

const downloadFile = () => {
  if (!materialData.value) return
  
  // 模拟下载
  ElMessage.success(`正在下载：${materialData.value.filename}`)
  
  // 增加下载次数
  if (materialData.value.downloadCount !== undefined) {
    materialData.value.downloadCount++
  }
}

const shareFile = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制链接')
  })
}

const addToFavorites = () => {
  ElMessage.success('已添加到收藏夹')
}

const reportIssue = () => {
  ElMessage.info('举报功能开发中')
}

const viewMaterial = (id: number) => {
  router.push(`/training/${id}`)
}

const showApprovalDialog = () => {
  approvalDialogVisible.value = true
}

const submitApproval = async () => {
  if (!approvalFormRef.value) return
  
  try {
    await approvalFormRef.value.validate()
    approvalSubmitting.value = true
    
    // 模拟提交审批
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newRecord: ApprovalComment = {
      id: Date.now(),
      materialId: materialData.value?.id || 0,
      approver: authStore.currentUser?.name || '',
      comment: approvalForm.comment,
      action: approvalForm.action as 'approve' | 'reject',
      status: 'completed',
      createdAt: new Date().toISOString()
    }
    
    approvalRecords.value.unshift(newRecord)
    
    // 更新资料状态
    if (materialData.value) {
      materialData.value.status = approvalForm.action === 'approve' ? 'approved' : 'rejected'
      materialData.value.approvedBy = authStore.currentUser?.username
      materialData.value.approvedAt = new Date().toISOString()
      if (approvalForm.action === 'reject') {
        materialData.value.rejectedReason = approvalForm.comment
      }
    }
    
    ElMessage.success('审批完成')
    approvalDialogVisible.value = false
    
    // 重置表单
    Object.assign(approvalForm, {
      action: 'approve',
      comment: ''
    })
    
  } catch (error) {
    ElMessage.error('请完善审批信息')
  } finally {
    approvalSubmitting.value = false
  }
}

// 初始化数据
const initData = () => {
  const id = parseInt(route.params.id as string)
  
  // 模拟获取培训资料数据
  const mockMaterial: TrainingMaterial = {
    id: id,
    title: '消防安全知识培训',
    content: '本培训资料包含消防安全基础知识、火灾预防措施、逃生技巧、灭火器使用方法等重要内容。适用于全体员工的基础安全培训，通过学习本资料，员工可以掌握基本的消防安全知识，提高安全意识和自救能力。',
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
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
  
  materialData.value = mockMaterial
  
  // 增加查看次数
  materialData.value.viewCount = (materialData.value.viewCount || 0) + 1
  
  // 模拟审批记录
  if (materialData.value.status === 'approved') {
    approvalRecords.value = [
      {
        id: 1,
        materialId: id,
        approver: '系统管理员',
        comment: '培训内容详实，符合安全培训要求，建议推广使用。',
        action: 'approve',
        status: 'completed',
        createdAt: '2024-01-10T10:00:00Z'
      }
    ]
  }
  
  // 模拟相关推荐
  recommendedMaterials.value = [
    {
      id: 2,
      title: '工作安全规范操作指南',
      topic: '操作安全',
      duration: 6,
      content: '',
      filename: '',
      fileSize: 0,
      fileType: '',
      instructor: '',
      department: '',
      username: '',
      status: 'approved',
      downloadCount: 0,
      viewCount: 0,
      tags: [],
      createdAt: ''
    },
    {
      id: 3,
      title: '电气安全培训教程',
      topic: '电气安全',
      duration: 8,
      content: '',
      filename: '',
      fileSize: 0,
      fileType: '',
      instructor: '',
      department: '',
      username: '',
      status: 'approved',
      downloadCount: 0,
      viewCount: 0,
      tags: [],
      createdAt: ''
    }
  ]
}

// 组件挂载
onMounted(() => {
  initData()
})
</script>

<style scoped>
.training-detail {
  max-width: 1200px;
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
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.divider {
  color: var(--text-disabled);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.detail-container {
  margin-bottom: var(--spacing-xl);
}

.info-card,
.file-card,
.approval-card {
  margin-bottom: var(--spacing-lg);
}

.info-card h3,
.file-card h3,
.approval-card h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.description-content {
  line-height: 1.6;
  color: var(--text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.file-section {
  margin-top: var(--spacing-md);
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.file-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-lighter);
  border-radius: var(--radius-md);
  color: var(--primary-color);
  font-size: 24px;
}

.file-name {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.file-meta {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.file-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.timeline-content {
  padding-bottom: var(--spacing-md);
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.timeline-comment {
  color: var(--text-secondary);
  line-height: 1.5;
}

.action-panel,
.stats-panel,
.recommend-panel {
  margin-bottom: var(--spacing-lg);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.stat-value {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.recommend-item {
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.recommend-item:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-lighter);
}

.recommend-title {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.recommend-meta {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .meta-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .file-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .file-actions {
    align-self: flex-end;
  }
  
  .header-actions {
    order: -1;
    align-self: flex-end;
  }
}

/* 深色主题适配 */
.dark .file-item {
  background-color: var(--bg-tertiary);
  border-color: var(--border-medium);
}

.dark .file-icon {
  background-color: rgba(30, 136, 229, 0.2);
}

.dark .recommend-item:hover {
  background-color: rgba(30, 136, 229, 0.1);
}
</style>