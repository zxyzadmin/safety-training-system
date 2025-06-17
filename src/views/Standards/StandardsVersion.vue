<template>
  <div class="standards-version">
    <div class="page-header">
      <div class="header-content">
        <div class="back-button">
          <el-button @click="goBack" :icon="ArrowLeft">
            返回详情
          </el-button>
        </div>
        <div class="header-info">
          <h1>版本管理</h1>
          <p>{{ standard?.title }} ({{ standard?.code }})</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog" :icon="Plus">
            创建新版本
          </el-button>
        </div>
      </div>
    </div>

    <div class="version-content">
      <el-card>
        <!-- 版本统计 -->
        <div class="version-stats">
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ versions.length }}</div>
                  <div class="stat-label">总版本数</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon active">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ activeVersions }}</div>
                  <div class="stat-label">活跃版本</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon draft">
                  <el-icon><Edit /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ draftVersions }}</div>
                  <div class="stat-label">草稿版本</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon latest">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">v{{ latestVersion }}</div>
                  <div class="stat-label">最新版本</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 版本时间线 -->
        <div class="version-timeline">
          <h3>版本历史</h3>
          <el-timeline>
            <el-timeline-item
              v-for="version in versions"
              :key="version.id"
              :timestamp="formatDateTime(version.createdAt)"
              :type="getVersionTimelineType(version)"
              :size="version.isCurrent ? 'large' : 'normal'"
              :hollow="version.status === 'draft'"
            >
              <div class="version-card">
                <div class="version-header">
                  <div class="version-info">
                    <div class="version-title">
                      <strong>v{{ version.version }}</strong>
                      <el-tag
                        v-if="version.isCurrent"
                        type="success"
                        size="small"
                        class="current-tag"
                      >
                        当前版本
                      </el-tag>
                      <el-tag
                        :type="getVersionTagType(version.updateType)"
                        size="small"
                      >
                        {{ getVersionText(version.updateType) }}
                      </el-tag>
                      <el-tag
                        :type="getStatusTagType(version.status)"
                        size="small"
                      >
                        {{ getStatusText(version.status) }}
                      </el-tag>
                    </div>
                    <div class="version-meta">
                      <span class="version-author">{{ version.createdBy }}</span>
                      <span class="version-date">{{ formatDate(version.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="version-actions">
                    <el-dropdown @command="(cmd) => handleVersionAction(cmd, version)" trigger="click">
                      <el-button type="text" :icon="MoreFilled" />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="view">查看详情</el-dropdown-item>
                          <el-dropdown-item command="download">下载文件</el-dropdown-item>
                          <el-dropdown-item command="compare" v-if="!version.isCurrent">版本对比</el-dropdown-item>
                          <el-dropdown-item command="activate" v-if="!version.isCurrent && version.status === 'published'">设为当前版本</el-dropdown-item>
                          <el-dropdown-item command="edit" v-if="version.status === 'draft'">编辑</el-dropdown-item>
                          <el-dropdown-item command="publish" v-if="version.status === 'draft'">发布版本</el-dropdown-item>
                          <el-dropdown-item command="delete" divided v-if="!version.isCurrent">删除版本</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>

                <div class="version-content">
                  <div class="version-notes">{{ version.updateNotes }}</div>
                  
                  <div class="version-details" v-if="version.changes && version.changes.length > 0">
                    <h4>主要变更</h4>
                    <ul class="change-list">
                      <li v-for="change in version.changes" :key="change.id" class="change-item">
                        <el-tag
                          :type="getChangeType(change.type)"
                          size="small"
                          class="change-tag"
                        >
                          {{ getChangeText(change.type) }}
                        </el-tag>
                        <span class="change-description">{{ change.description }}</span>
                      </li>
                    </ul>
                  </div>

                  <div class="version-files" v-if="version.files && version.files.length > 0">
                    <h4>相关文件</h4>
                    <div class="file-list">
                      <div
                        v-for="file in version.files"
                        :key="file.id"
                        class="file-item"
                      >
                        <div class="file-info">
                          <el-icon class="file-icon"><Document /></el-icon>
                          <div class="file-details">
                            <div class="file-name">{{ file.name }}</div>
                            <div class="file-meta">
                              {{ formatFileSize(file.size) }} | {{ file.type }}
                            </div>
                          </div>
                        </div>
                        <div class="file-actions">
                          <el-button type="text" size="small" @click="downloadFile(file)">
                            下载
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="version-stats" v-if="version.downloadCount">
                    <div class="stat-item">
                      <el-icon><Download /></el-icon>
                      <span>下载 {{ version.downloadCount }} 次</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- 创建新版本对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建新版本"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="版本号" prop="version">
          <el-input
            v-model="createForm.version"
            placeholder="请输入版本号，如2024.1"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="更新类型" prop="updateType">
          <el-radio-group v-model="createForm.updateType">
            <el-radio label="major">大版本更新</el-radio>
            <el-radio label="minor">小版本更新</el-radio>
            <el-radio label="patch">补丁更新</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="更新说明" prop="updateNotes">
          <el-input
            v-model="createForm.updateNotes"
            type="textarea"
            :rows="4"
            placeholder="请详细说明本次更新的内容和变更点"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="主要变更">
          <div class="changes-input">
            <div
              v-for="(change, index) in createForm.changes"
              :key="index"
              class="change-input-item"
            >
              <el-select v-model="change.type" placeholder="变更类型" style="width: 120px;">
                <el-option label="新增" value="add" />
                <el-option label="修改" value="modify" />
                <el-option label="删除" value="remove" />
                <el-option label="修复" value="fix" />
              </el-select>
              <el-input
                v-model="change.description"
                placeholder="变更描述"
                style="flex: 1; margin: 0 8px;"
              />
              <el-button
                type="text"
                @click="removeChange(index)"
                :icon="Delete"
                class="danger-text"
              />
            </div>
            <el-button
              type="text"
              @click="addChange"
              :icon="Plus"
              class="add-change-btn"
            >
              添加变更
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="createForm.status">
            <el-radio label="draft">保存为草稿</el-radio>
            <el-radio label="published">立即发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createVersion" :loading="creating">
            {{ createForm.status === 'published' ? '发布版本' : '保存草稿' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 版本对比对话框 -->
    <el-dialog
      v-model="compareDialogVisible"
      title="版本对比"
      width="800px"
    >
      <div class="version-compare">
        <div class="compare-header">
          <div class="compare-info">
            <div class="compare-item">
              <h4>当前版本</h4>
              <p>v{{ currentVersion?.version }} ({{ formatDate(currentVersion?.createdAt) }})</p>
            </div>
            <el-icon class="compare-icon"><Switch /></el-icon>
            <div class="compare-item">
              <h4>对比版本</h4>
              <p>v{{ compareVersion?.version }} ({{ formatDate(compareVersion?.createdAt) }})</p>
            </div>
          </div>
        </div>
        
        <div class="compare-content">
          <el-tabs v-model="compareTab">
            <el-tab-pane label="更新说明" name="notes">
              <div class="compare-notes">
                <div class="note-section">
                  <h5>当前版本</h5>
                  <p>{{ currentVersion?.updateNotes }}</p>
                </div>
                <div class="note-section">
                  <h5>对比版本</h5>
                  <p>{{ compareVersion?.updateNotes }}</p>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="变更对比" name="changes">
              <div class="compare-changes">
                <div class="changes-section">
                  <h5>当前版本变更</h5>
                  <ul class="change-list">
                    <li
                      v-for="change in currentVersion?.changes"
                      :key="change.id"
                      class="change-item"
                    >
                      <el-tag :type="getChangeType(change.type)" size="small">
                        {{ getChangeText(change.type) }}
                      </el-tag>
                      <span>{{ change.description }}</span>
                    </li>
                  </ul>
                </div>
                <div class="changes-section">
                  <h5>对比版本变更</h5>
                  <ul class="change-list">
                    <li
                      v-for="change in compareVersion?.changes"
                      :key="change.id"
                      class="change-item"
                    >
                      <el-tag :type="getChangeType(change.type)" size="small">
                        {{ getChangeText(change.type) }}
                      </el-tag>
                      <span>{{ change.description }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Plus,
  MoreFilled,
  Document,
  Check,
  Edit,
  Star,
  Download,
  Delete,
  Switch
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const createDialogVisible = ref(false)
const compareDialogVisible = ref(false)
const creating = ref(false)
const createFormRef = ref<FormInstance>()
const compareTab = ref('notes')
const currentVersion = ref(null as any)
const compareVersion = ref(null as any)

// 标准信息
const standard = ref({
  id: 1,
  title: '建筑设计防火规范',
  code: 'GB 50016-2014'
})

// 创建表单
const createForm = reactive({
  version: '',
  updateType: 'minor',
  updateNotes: '',
  status: 'draft',
  changes: [] as Array<{ type: string; description: string }>
})

// 版本数据
const versions = ref([
  {
    id: 1,
    version: '2024.1',
    updateType: 'minor',
    updateNotes: '修正了第3.2.5条款中的计算公式错误，增加了新的安全出口设计要求。',
    status: 'published',
    isCurrent: true,
    downloadCount: 45,
    createdBy: '技术委员会',
    createdAt: '2024-01-15T10:00:00Z',
    changes: [
      { id: 1, type: 'fix', description: '修正第3.2.5条款计算公式' },
      { id: 2, type: 'add', description: '新增安全出口设计要求' },
      { id: 3, type: 'modify', description: '更新建筑分类标准' }
    ],
    files: [
      {
        id: 1,
        name: 'GB50016-2024.1.pdf',
        size: 5242880,
        type: 'PDF'
      }
    ]
  },
  {
    id: 2,
    version: '2014',
    updateType: 'major',
    updateNotes: '初始版本发布，建立了完整的建筑防火设计规范体系。',
    status: 'published',
    isCurrent: false,
    downloadCount: 1234,
    createdBy: '标准委员会',
    createdAt: '2014-08-27T10:00:00Z',
    changes: [
      { id: 1, type: 'add', description: '建立建筑防火设计规范体系' },
      { id: 2, type: 'add', description: '定义建筑分类和耐火等级' },
      { id: 3, type: 'add', description: '规定总平面布置要求' }
    ],
    files: [
      {
        id: 1,
        name: 'GB50016-2014.pdf',
        size: 4194304,
        type: 'PDF'
      }
    ]
  },
  {
    id: 3,
    version: '2024.2',
    updateType: 'minor',
    updateNotes: '准备中的版本，将包含新的环保要求和智能建筑相关规定。',
    status: 'draft',
    isCurrent: false,
    downloadCount: 0,
    createdBy: '研发小组',
    createdAt: '2024-01-20T14:30:00Z',
    changes: [
      { id: 1, type: 'add', description: '新增环保要求条款' },
      { id: 2, type: 'add', description: '智能建筑防火设计规定' }
    ],
    files: []
  }
])

// 表单验证规则
const createRules: FormRules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { min: 1, max: 20, message: '版本号长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  updateType: [
    { required: true, message: '请选择更新类型', trigger: 'change' }
  ],
  updateNotes: [
    { required: true, message: '请输入更新说明', trigger: 'blur' },
    { min: 10, max: 500, message: '更新说明长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择发布状态', trigger: 'change' }
  ]
}

// 计算属性
const activeVersions = computed(() => {
  return versions.value.filter(v => v.status === 'published').length
})

const draftVersions = computed(() => {
  return versions.value.filter(v => v.status === 'draft').length
})

const latestVersion = computed(() => {
  const publishedVersions = versions.value.filter(v => v.status === 'published')
  if (publishedVersions.length === 0) return '0'
  return publishedVersions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].version
})

// 工具方法
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

const getVersionTimelineType = (version: any) => {
  if (version.isCurrent) return 'primary'
  if (version.status === 'draft') return 'info'
  return 'success'
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

const getStatusTagType = (status: string) => {
  const types = {
    published: 'success',
    draft: 'info',
    archived: 'warning'
  }
  return types[status as keyof typeof types] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return texts[status as keyof typeof texts] || status
}

const getChangeType = (changeType: string) => {
  const types = {
    add: 'success',
    modify: 'warning',
    remove: 'danger',
    fix: 'info'
  }
  return types[changeType as keyof typeof types] || 'default'
}

const getChangeText = (changeType: string) => {
  const texts = {
    add: '新增',
    modify: '修改',
    remove: '删除',
    fix: '修复'
  }
  return texts[changeType as keyof typeof texts] || changeType
}

// 事件处理
const goBack = () => {
  router.push(`/standards/${standard.value.id}`)
}

const showCreateDialog = () => {
  createForm.version = ''
  createForm.updateType = 'minor'
  createForm.updateNotes = ''
  createForm.status = 'draft'
  createForm.changes = []
  createDialogVisible.value = true
}

const addChange = () => {
  createForm.changes.push({ type: 'add', description: '' })
}

const removeChange = (index: number) => {
  createForm.changes.splice(index, 1)
}

const createVersion = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    
    creating.value = true

    // 模拟创建版本
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newVersion = {
      id: versions.value.length + 1,
      version: createForm.version,
      updateType: createForm.updateType,
      updateNotes: createForm.updateNotes,
      status: createForm.status,
      isCurrent: false,
      downloadCount: 0,
      createdBy: '当前用户',
      createdAt: new Date().toISOString(),
      changes: createForm.changes.filter(c => c.description),
      files: []
    }

    versions.value.unshift(newVersion)
    createDialogVisible.value = false

    ElMessage.success(createForm.status === 'published' ? '版本发布成功！' : '草稿保存成功！')

  } catch (error) {
    ElMessage.error('请完善版本信息')
  } finally {
    creating.value = false
  }
}

const handleVersionAction = (command: string, version: any) => {
  switch (command) {
    case 'view':
      ElMessage.info(`查看版本 v${version.version}`)
      break
    case 'download':
      ElMessage.success(`正在下载版本 v${version.version}`)
      version.downloadCount++
      break
    case 'compare':
      currentVersion.value = versions.value.find(v => v.isCurrent)
      compareVersion.value = version
      compareDialogVisible.value = true
      break
    case 'activate':
      activateVersion(version)
      break
    case 'edit':
      ElMessage.info(`编辑版本 v${version.version}`)
      break
    case 'publish':
      publishVersion(version)
      break
    case 'delete':
      deleteVersion(version)
      break
  }
}

const activateVersion = (version: any) => {
  ElMessageBox.confirm(
    `确定要将版本 v${version.version} 设为当前版本吗？`,
    '激活版本',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 取消当前版本标记
    versions.value.forEach(v => {
      v.isCurrent = false
    })
    // 设置新的当前版本
    version.isCurrent = true
    ElMessage.success('版本激活成功')
  }).catch(() => {
    // 用户取消
  })
}

const publishVersion = (version: any) => {
  ElMessageBox.confirm(
    `确定要发布版本 v${version.version} 吗？`,
    '发布版本',
    {
      confirmButtonText: '发布',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    version.status = 'published'
    ElMessage.success('版本发布成功')
  }).catch(() => {
    // 用户取消
  })
}

const deleteVersion = (version: any) => {
  ElMessageBox.confirm(
    `确定要删除版本 v${version.version} 吗？此操作不可恢复。`,
    '删除版本',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = versions.value.findIndex(v => v.id === version.id)
    if (index > -1) {
      versions.value.splice(index, 1)
      ElMessage.success('版本删除成功')
    }
  }).catch(() => {
    // 用户取消
  })
}

const downloadFile = (file: any) => {
  ElMessage.success(`正在下载：${file.name}`)
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.standards-version {
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
  align-items: center;
  gap: var(--spacing-lg);
}

.header-info h1 {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.header-info p {
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.version-stats {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
  transition: all var(--transition-normal);
}

.stat-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background-color: var(--primary-lighter);
  color: var(--primary-color);
  font-size: 24px;
}

.stat-icon.active {
  background-color: #f0f9ff;
  color: #0ea5e9;
}

.stat-icon.draft {
  background-color: #fef3c7;
  color: #f59e0b;
}

.stat-icon.latest {
  background-color: #fef7f0;
  color: #ea580c;
}

.stat-number {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.version-timeline h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.version-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.version-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  flex-wrap: wrap;
}

.current-tag {
  background-color: var(--success-color);
  border-color: var(--success-color);
}

.version-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.version-content .version-notes {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.version-details h4,
.version-files h4 {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.change-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.change-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.change-tag {
  flex-shrink: 0;
}

.change-description {
  color: var(--text-secondary);
  line-height: 1.5;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.file-icon {
  color: var(--primary-color);
  font-size: 18px;
}

.file-name {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.file-meta {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.version-stats .stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-top: var(--spacing-md);
}

.changes-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.change-input-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.add-change-btn {
  margin-top: var(--spacing-sm);
  align-self: flex-start;
}

.danger-text {
  color: var(--danger-color);
}

.version-compare {
  padding: var(--spacing-md);
}

.compare-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.compare-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compare-item {
  flex: 1;
  text-align: center;
}

.compare-item h4 {
  font-size: var(--font-md);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.compare-item p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.compare-icon {
  font-size: 24px;
  color: var(--text-disabled);
  margin: 0 var(--spacing-lg);
}

.compare-notes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.note-section h5 {
  font-size: var(--font-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.note-section p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.compare-changes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.changes-section h5 {
  font-size: var(--font-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .version-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .version-title {
    justify-content: flex-start;
  }
  
  .compare-info {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .compare-icon {
    transform: rotate(90deg);
    margin: var(--spacing-md) 0;
  }
  
  .compare-notes,
  .compare-changes {
    grid-template-columns: 1fr;
  }
  
  .change-input-item {
    flex-direction: column;
    align-items: stretch;
  }
}

/* 深色主题适配 */
.dark .stat-card {
  background-color: var(--bg-tertiary);
  border-color: var(--border-light);
}

.dark .version-card {
  background-color: var(--bg-secondary);
  border-color: var(--border-light);
}

.dark .file-item {
  background-color: var(--bg-tertiary);
  border-color: var(--border-light);
}

.dark .stat-icon {
  background-color: rgba(30, 136, 229, 0.2);
}

.dark .stat-icon.active {
  background-color: rgba(14, 165, 233, 0.2);
}

.dark .stat-icon.draft {
  background-color: rgba(245, 158, 11, 0.2);
}

.dark .stat-icon.latest {
  background-color: rgba(234, 88, 12, 0.2);
}
</style>