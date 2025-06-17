<template>
  <div class="training-upload">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ isEdit ? '编辑培训资料' : '上传培训资料' }}</h1>
          <p>{{ isEdit ? '修改现有培训资料信息' : '上传新的安全培训资料，完善企业培训体系' }}</p>
        </div>
        <div class="header-actions">
          <el-button @click="goBack" :icon="ArrowLeft">
            返回列表
          </el-button>
        </div>
      </div>
    </div>

    <div class="upload-container">
      <el-card class="upload-card">
        <template #header>
          <div class="card-header">
            <h3>{{ isEdit ? '资料信息' : '基本信息' }}</h3>
            <el-steps :active="currentStep" simple>
              <el-step title="基本信息" />
              <el-step title="文件上传" />
              <el-step title="预览确认" />
            </el-steps>
          </div>
        </template>

        <!-- 步骤1: 基本信息 -->
        <div v-show="currentStep === 0" class="step-content">
          <el-form
            ref="basicFormRef"
            :model="formData"
            :rules="basicRules"
            label-width="120px"
            class="basic-form"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="资料标题" prop="title">
                  <el-input
                    v-model="formData.title"
                    placeholder="请输入培训资料标题"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="培训主题" prop="topic">
                  <el-select
                    v-model="formData.topic"
                    placeholder="请选择培训主题"
                    filterable
                    allow-create
                  >
                    <el-option label="消防安全" value="消防安全" />
                    <el-option label="操作安全" value="操作安全" />
                    <el-option label="电气安全" value="电气安全" />
                    <el-option label="化学安全" value="化学安全" />
                    <el-option label="机械安全" value="机械安全" />
                    <el-option label="交通安全" value="交通安全" />
                    <el-option label="环境安全" value="环境安全" />
                    <el-option label="应急处理" value="应急处理" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="讲师姓名" prop="instructor">
                  <el-input
                    v-model="formData.instructor"
                    placeholder="请输入讲师姓名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="培训课时" prop="duration">
                  <el-input-number
                    v-model="formData.duration"
                    :min="0.5"
                    :max="100"
                    :step="0.5"
                    placeholder="课时"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="所属部门" prop="department">
                  <el-select v-model="formData.department" placeholder="请选择部门">
                    <el-option label="安全科" value="安全科" />
                    <el-option label="生产部" value="生产部" />
                    <el-option label="技术部" value="技术部" />
                    <el-option label="人事部" value="人事部" />
                    <el-option label="行政部" value="行政部" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="培训级别" prop="level">
                  <el-select v-model="formData.level" placeholder="请选择培训级别">
                    <el-option label="入门级" value="beginner" />
                    <el-option label="中级" value="intermediate" />
                    <el-option label="高级" value="advanced" />
                    <el-option label="专家级" value="expert" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="资料描述" prop="content">
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="4"
                placeholder="请详细描述培训资料的内容、适用对象、学习目标等"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="关键标签" prop="tags">
              <el-select
                v-model="formData.tags"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入关键标签"
                style="width: 100%"
              >
                <el-option label="安全培训" value="安全培训" />
                <el-option label="操作规范" value="操作规范" />
                <el-option label="应急处理" value="应急处理" />
                <el-option label="防护措施" value="防护措施" />
                <el-option label="风险评估" value="风险评估" />
                <el-option label="法规标准" value="法规标准" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 文件上传 -->
        <div v-show="currentStep === 1" class="step-content">
          <div class="upload-section">
            <el-upload
              ref="uploadRef"
              class="upload-dragger"
              drag
              :auto-upload="false"
              :multiple="false"
              :file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :before-upload="beforeUpload"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、Word、PPT、视频文件，单个文件不超过 100MB
                </div>
              </template>
            </el-upload>

            <div v-if="fileList.length > 0" class="file-preview">
              <h4>已选择文件</h4>
              <div class="file-item" v-for="file in fileList" :key="file.uid">
                <div class="file-info">
                  <el-icon class="file-icon">
                    <document />
                  </el-icon>
                  <div class="file-details">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
                <div class="file-actions">
                  <el-button
                    type="text"
                    size="small"
                    @click="handleFileRemove(file)"
                    :icon="Delete"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3: 预览确认 -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="preview-section">
            <h4>请确认以下信息</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="资料标题">
                {{ formData.title }}
              </el-descriptions-item>
              <el-descriptions-item label="培训主题">
                {{ formData.topic }}
              </el-descriptions-item>
              <el-descriptions-item label="讲师姓名">
                {{ formData.instructor }}
              </el-descriptions-item>
              <el-descriptions-item label="培训课时">
                {{ formData.duration }} 课时
              </el-descriptions-item>
              <el-descriptions-item label="所属部门">
                {{ formData.department }}
              </el-descriptions-item>
              <el-descriptions-item label="培训级别">
                {{ getLevelText(formData.level) }}
              </el-descriptions-item>
              <el-descriptions-item label="关键标签" :span="2">
                <el-tag
                  v-for="tag in formData.tags"
                  :key="tag"
                  style="margin-right: 8px"
                >
                  {{ tag }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="资料描述" :span="2">
                {{ formData.content }}
              </el-descriptions-item>
              <el-descriptions-item label="上传文件" :span="2">
                <div v-if="fileList.length > 0">
                  <div v-for="file in fileList" :key="file.uid" class="file-summary">
                    {{ file.name }} ({{ formatFileSize(file.size) }})
                  </div>
                </div>
                <div v-else class="no-file">未上传文件</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button
            v-if="currentStep > 0"
            @click="prevStep"
            :icon="ArrowLeft"
          >
            上一步
          </el-button>
          
          <el-button
            v-if="currentStep < 2"
            type="primary"
            @click="nextStep"
            :icon="ArrowRight"
          >
            下一步
          </el-button>
          
          <el-button
            v-if="currentStep === 2"
            type="primary"
            @click="submitForm"
            :loading="submitting"
            :icon="Check"
          >
            {{ isEdit ? '保存修改' : '提交审核' }}
          </el-button>
          
          <el-button @click="resetForm">
            重置
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Delete,
  Document,
  UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const basicFormRef = ref<FormInstance>()
const uploadRef = ref()

// 页面状态
const currentStep = ref(0)
const submitting = ref(false)
const isEdit = computed(() => !!route.query.id)

// 表单数据
const formData = reactive({
  title: '',
  topic: '',
  instructor: '',
  duration: 2,
  department: authStore.currentUser?.department || '',
  level: 'beginner',
  content: '',
  tags: [] as string[]
})

// 文件列表
const fileList = ref<UploadFile[]>([])

// 表单验证规则
const basicRules: FormRules = {
  title: [
    { required: true, message: '请输入资料标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  topic: [
    { required: true, message: '请选择培训主题', trigger: 'change' }
  ],
  instructor: [
    { required: true, message: '请输入讲师姓名', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入培训课时', trigger: 'blur' },
    { type: 'number', min: 0.5, max: 100, message: '课时应在 0.5 到 100 之间', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择培训级别', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入资料描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 获取级别文本
const getLevelText = (level: string) => {
  const levelMap = {
    beginner: '入门级',
    intermediate: '中级',
    advanced: '高级',
    expert: '专家级'
  }
  return levelMap[level as keyof typeof levelMap] || level
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

// 文件上传相关
const handleFileChange = (file: UploadFile, files: UploadFiles) => {
  fileList.value = files
}

const handleFileRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

const beforeUpload = (file: File) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4', 'video/avi', 'video/quicktime'].includes(file.type)
  
  if (!isValidType) {
    ElMessage.error('只支持 PDF、Word、PPT、视频文件!')
    return false
  }

  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过 100MB!')
    return false
  }

  return true
}

// 步骤控制
const nextStep = async () => {
  if (currentStep.value === 0) {
    // 验证基本信息
    if (!basicFormRef.value) return
    
    try {
      await basicFormRef.value.validate()
      currentStep.value++
    } catch (error) {
      ElMessage.error('请完善基本信息')
    }
  } else if (currentStep.value === 1) {
    // 验证文件上传
    if (fileList.value.length === 0) {
      ElMessage.warning('请至少上传一个培训文件')
      return
    }
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 表单提交
const submitForm = async () => {
  submitting.value = true
  
  try {
    // 模拟提交过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 这里应该调用API提交数据
    const submitData = {
      ...formData,
      files: fileList.value.map(file => ({
        name: file.name,
        size: file.size,
        type: file.raw?.type
      })),
      username: authStore.currentUser?.username,
      status: 'pending', // 待审核状态
      createdAt: new Date().toISOString()
    }
    
    console.log('提交数据:', submitData)
    
    ElMessage.success(isEdit.value ? '修改成功！' : '提交成功，等待审核！')
    
    // 返回列表页
    setTimeout(() => {
      router.push('/training')
    }, 1500)
    
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  ElMessageBox.confirm(
    '确定要重置表单吗？所有填写的内容将被清空。',
    '重置确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    Object.assign(formData, {
      title: '',
      topic: '',
      instructor: '',
      duration: 2,
      department: authStore.currentUser?.department || '',
      level: 'beginner',
      content: '',
      tags: []
    })
    fileList.value = []
    currentStep.value = 0
    basicFormRef.value?.resetFields()
    ElMessage.success('表单已重置')
  }).catch(() => {
    // 用户取消
  })
}

// 返回列表
const goBack = () => {
  if (currentStep.value > 0 || formData.title || fileList.value.length > 0) {
    ElMessageBox.confirm(
      '确定要离开吗？未保存的内容将会丢失。',
      '离开确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.push('/training')
    }).catch(() => {
      // 用户取消
    })
  } else {
    router.push('/training')
  }
}

// 组件挂载时的初始化
onMounted(() => {
  if (isEdit.value) {
    // 如果是编辑模式，加载现有数据
    const id = route.query.id
    // 这里应该根据ID加载数据
    console.log('编辑模式，ID:', id)
  }
})
</script>

<style scoped>
.training-upload {
  max-width: 1000px;
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

.upload-card {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.step-content {
  margin: var(--spacing-xl) 0;
}

.basic-form {
  max-width: 800px;
}

.upload-section {
  text-align: center;
}

.upload-dragger {
  margin-bottom: var(--spacing-lg);
}

.file-preview {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
}

.file-preview h4 {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  background-color: var(--bg-secondary);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.file-icon {
  font-size: 24px;
  color: var(--primary-color);
}

.file-name {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.file-size {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.preview-section h4 {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.file-summary {
  margin-bottom: var(--spacing-xs);
}

.no-file {
  color: var(--text-secondary);
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .card-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .file-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* 深色主题适配 */
.dark .upload-card {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
}

.dark .file-item {
  background-color: var(--bg-tertiary);
  border-color: var(--border-medium);
}
</style>