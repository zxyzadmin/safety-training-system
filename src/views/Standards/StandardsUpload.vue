<template>
  <div class="standards-upload">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="upload-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="标准编号" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入标准编号，如GB 50016-2014"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input
                v-model="formData.version"
                placeholder="请输入版本号，如2014或1.0"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标准名称" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入标准名称"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="标准分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择标准分类">
                <el-option label="国家标准" value="national" />
                <el-option label="行业标准" value="industry" />
                <el-option label="企业标准" value="enterprise" />
                <el-option label="国际标准" value="international" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用领域" prop="domain">
              <el-select v-model="formData.domain" placeholder="请选择适用领域">
                <el-option label="消防安全" value="fire" />
                <el-option label="化学安全" value="chemical" />
                <el-option label="机械安全" value="mechanical" />
                <el-option label="电气安全" value="electrical" />
                <el-option label="环境保护" value="environment" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="发布机构" prop="publisher">
          <el-input
            v-model="formData.publisher"
            placeholder="请输入发布机构名称"
            maxlength="200"
          />
        </el-form-item>

        <el-form-item label="标准描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述标准的适用范围、主要内容和要求"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 时间管理 -->
      <div class="form-section">
        <h3 class="section-title">时间管理</h3>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="发布日期" prop="publishDate">
              <el-date-picker
                v-model="formData.publishDate"
                type="date"
                placeholder="选择发布日期"
                style="width: 100%"
                :disabled-date="disabledPublishDate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="formData.effectiveDate"
                type="date"
                placeholder="选择生效日期"
                style="width: 100%"
                :disabled-date="disabledEffectiveDate"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="有效期类型" prop="expiryType">
              <el-radio-group v-model="formData.expiryType">
                <el-radio label="permanent">长期有效</el-radio>
                <el-radio label="dated">指定到期日期</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.expiryType === 'dated'">
            <el-form-item label="到期日期" prop="expiryDate">
              <el-date-picker
                v-model="formData.expiryDate"
                type="date"
                placeholder="选择到期日期"
                style="width: 100%"
                :disabled-date="disabledExpiryDate"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 版本控制 -->
      <div class="form-section" v-if="isEdit">
        <h3 class="section-title">版本控制</h3>
        <el-form-item label="更新类型" prop="updateType">
          <el-radio-group v-model="formData.updateType">
            <el-radio label="minor">小版本更新</el-radio>
            <el-radio label="major">大版本更新</el-radio>
            <el-radio label="patch">补丁更新</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="更新说明" prop="updateNotes">
          <el-input
            v-model="formData.updateNotes"
            type="textarea"
            :rows="3"
            placeholder="请说明本次更新的主要内容和变更点"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <div class="version-history" v-if="versionHistory.length > 0">
          <h4>版本历史</h4>
          <el-timeline>
            <el-timeline-item
              v-for="version in versionHistory"
              :key="version.id"
              :timestamp="formatDateTime(version.createdAt)"
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
      </div>

      <!-- 文件上传 -->
      <div class="form-section">
        <h3 class="section-title">文件上传</h3>
        <el-form-item label="标准文档" prop="file">
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
            accept=".pdf,.doc,.docx"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word 文档，单个文件不超过 50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <div v-if="fileList.length > 0" class="file-info">
          <h4>文件信息</h4>
          <div v-for="file in fileList" :key="file.uid" class="file-item">
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span>{{ formatFileSize(file.size) }}</span>
                <span class="divider">|</span>
                <span>{{ getFileType(file.name) }}</span>
              </div>
            </div>
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

      <!-- 状态设置 -->
      <div class="form-section">
        <h3 class="section-title">状态设置</h3>
        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="draft">保存为草稿</el-radio>
            <el-radio label="valid">立即发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="访问权限" prop="accessLevel">
          <el-select v-model="formData.accessLevel" placeholder="请选择访问权限">
            <el-option label="公开" value="public" />
            <el-option label="内部" value="internal" />
            <el-option label="机密" value="confidential" />
          </el-select>
        </el-form-item>

        <el-form-item label="提醒设置" prop="reminderSettings">
          <el-checkbox-group v-model="formData.reminderSettings">
            <el-checkbox label="expiry_30">到期前30天提醒</el-checkbox>
            <el-checkbox label="expiry_7">到期前7天提醒</el-checkbox>
            <el-checkbox label="version_update">版本更新提醒</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? '更新标准' : '发布标准' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { UploadFilled, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import { useAuthStore } from '@/store/auth'

// Props 和 Emits
interface Props {
  standard?: any
}

const props = withDefaults(defineProps<Props>(), {
  standard: null
})

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const formRef = ref<FormInstance>()
const uploadRef = ref()
const submitting = ref(false)
const saving = ref(false)
const fileList = ref<UploadFile[]>([])

const isEdit = computed(() => !!props.standard)

// 表单数据
const formData = reactive({
  code: '',
  title: '',
  version: '',
  category: '',
  domain: '',
  publisher: '',
  description: '',
  publishDate: '',
  effectiveDate: '',
  expiryType: 'permanent',
  expiryDate: '',
  updateType: 'minor',
  updateNotes: '',
  status: 'draft',
  accessLevel: 'internal',
  reminderSettings: [] as string[]
})

// 版本历史
const versionHistory = ref([
  {
    id: 1,
    version: '2014',
    updateType: 'major',
    updateNotes: '初始版本发布，建立了完整的建筑防火设计规范体系。',
    createdBy: '标准委员会',
    createdAt: '2014-08-27T10:00:00Z'
  }
])

// 表单验证规则
const formRules: FormRules = {
  code: [
    { required: true, message: '请输入标准编号', trigger: 'blur' },
    { min: 3, max: 50, message: '标准编号长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入标准名称', trigger: 'blur' },
    { min: 5, max: 200, message: '标准名称长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择标准分类', trigger: 'change' }
  ],
  domain: [
    { required: true, message: '请选择适用领域', trigger: 'change' }
  ],
  publisher: [
    { required: true, message: '请输入发布机构', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入标准描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度在 10 到 1000 个字符', trigger: 'blur' }
  ],
  publishDate: [
    { required: true, message: '请选择发布日期', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '请选择生效日期', trigger: 'change' }
  ],
  expiryDate: [
    { 
      validator: (rule, value, callback) => {
        if (formData.expiryType === 'dated' && !value) {
          callback(new Error('请选择到期日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  updateNotes: [
    {
      validator: (rule, value, callback) => {
        if (isEdit.value && !value) {
          callback(new Error('请输入更新说明'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 工具方法
const formatFileSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

const getFileType = (filename: string) => {
  const ext = filename.split('.').pop()?.toUpperCase()
  return ext || '未知'
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
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

// 日期禁用逻辑
const disabledPublishDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const disabledEffectiveDate = (time: Date) => {
  if (!formData.publishDate) return false
  return time.getTime() < new Date(formData.publishDate).getTime()
}

const disabledExpiryDate = (time: Date) => {
  if (!formData.effectiveDate) return false
  return time.getTime() < new Date(formData.effectiveDate).getTime()
}

// 文件上传
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
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  
  if (!isValidType) {
    ElMessage.error('只支持 PDF、Word 文档!')
    return false
  }

  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB!')
    return false
  }

  return true
}

// 表单操作
const saveDraft = async () => {
  if (!formRef.value) return

  saving.value = true
  try {
    // 基本验证（不包括文件）
    const requiredFields = ['code', 'title', 'version', 'category', 'domain', 'publisher']
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        ElMessage.warning('请完善基本信息后再保存草稿')
        return
      }
    }

    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    if (fileList.value.length === 0) {
      ElMessage.warning('请上传标准文档')
      return
    }

    submitting.value = true

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 2000))

    const submitData = {
      ...formData,
      files: fileList.value.map(file => ({
        name: file.name,
        size: file.size,
        type: file.raw?.type
      })),
      createdBy: authStore.currentUser?.name,
      createdAt: new Date().toISOString()
    }

    console.log('提交数据:', submitData)

    ElMessage.success(isEdit.value ? '标准更新成功！' : '标准发布成功！')
    emit('success')

  } catch (error) {
    ElMessage.error('请完善标准信息')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

// 初始化
onMounted(() => {
  if (props.standard) {
    // 编辑模式，填充表单数据
    Object.assign(formData, {
      code: props.standard.code,
      title: props.standard.title,
      version: props.standard.version,
      category: props.standard.category,
      domain: props.standard.domain,
      publisher: props.standard.publisher,
      description: props.standard.description,
      publishDate: props.standard.publishDate,
      effectiveDate: props.standard.effectiveDate || props.standard.publishDate,
      expiryType: props.standard.expiryDate ? 'dated' : 'permanent',
      expiryDate: props.standard.expiryDate || '',
      status: props.standard.status,
      accessLevel: 'internal',
      reminderSettings: ['expiry_30']
    })
  }
})
</script>

<style scoped>
.standards-upload {
  max-width: 800px;
  margin: 0 auto;
}

.upload-form {
  padding: var(--spacing-lg);
}

.form-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--primary-color);
}

.upload-dragger {
  margin-bottom: var(--spacing-lg);
}

.file-info h4 {
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
  background-color: var(--bg-secondary);
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.file-meta {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.divider {
  margin: 0 var(--spacing-xs);
  color: var(--text-disabled);
}

.version-history {
  margin-top: var(--spacing-lg);
}

.version-history h4 {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
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
}

.version-author {
  font-size: var(--font-xs);
  color: var(--text-disabled);
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
  .standards-upload {
    margin: 0;
    padding: var(--spacing-md);
  }
  
  .upload-form {
    padding: var(--spacing-md);
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* 深色主题适配 */
.dark .file-item {
  background-color: var(--bg-tertiary);
  border-color: var(--border-medium);
}
</style>