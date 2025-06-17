// 数据模型定义
import { validators, type ValidationRules } from '@/utils/validation'

// 基础模型接口
export interface BaseModel {
  id?: number | string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// 用户模型
export interface User extends BaseModel {
  username: string
  email: string
  name: string
  avatar?: string
  phone?: string
  department?: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt?: string
}

// 用户验证规则
export const userValidationRules: ValidationRules = {
  username: [
    validators.required('用户名不能为空'),
    validators.minLength(3, '用户名至少3个字符'),
    validators.maxLength(20, '用户名不能超过20个字符'),
    validators.custom(
      (value: string) => /^[a-zA-Z0-9_]+$/.test(value),
      '用户名只能包含字母、数字和下划线'
    )
  ],
  email: [
    validators.required('邮箱不能为空'),
    validators.email('邮箱格式不正确')
  ],
  name: [
    validators.required('姓名不能为空'),
    validators.minLength(2, '姓名至少2个字符'),
    validators.maxLength(50, '姓名不能超过50个字符')
  ],
  phone: [
    validators.phone('手机号格式不正确')
  ],
  department: [
    validators.required('部门不能为空')
  ]
}

// 培训资料模型
export interface TrainingMaterial extends BaseModel {
  title: string
  content: string
  filename: string
  fileSize: number
  fileType: string
  filePath?: string
  topic: string
  duration: number // 课时
  instructor: string
  department: string
  username: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  downloadCount: number
  viewCount: number
  tags: string[]
  category?: string
  description?: string
  requirements?: string[] // 培训要求
  objectives?: string[] // 培训目标
  validUntil?: string // 有效期
}

// 培训资料验证规则
export const trainingMaterialValidationRules: ValidationRules = {
  title: [
    validators.required('标题不能为空'),
    validators.minLength(2, '标题至少2个字符'),
    validators.maxLength(100, '标题不能超过100个字符')
  ],
  content: [
    validators.required('内容描述不能为空'),
    validators.minLength(10, '内容描述至少10个字符'),
    validators.maxLength(2000, '内容描述不能超过2000个字符')
  ],
  topic: [
    validators.required('培训主题不能为空'),
    validators.maxLength(50, '培训主题不能超过50个字符')
  ],
  duration: [
    validators.required('培训时长不能为空'),
    validators.range(0.5, 100, '培训时长必须在0.5到100课时之间')
  ],
  instructor: [
    validators.required('培训讲师不能为空'),
    validators.maxLength(50, '讲师姓名不能超过50个字符')
  ],
  department: [
    validators.required('所属部门不能为空')
  ],
  file: [
    validators.required('请选择培训文件'),
    validators.fileSize(50, '文件大小不能超过50MB'),
    validators.fileType(['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.mp4', '.avi'], '支持文档和视频格式')
  ]
}

// 档案资料模型
export interface ArchiveMaterial extends BaseModel {
  title: string
  description: string
  category: string
  subcategory?: string
  fileList: ArchiveFile[]
  status: 'draft' | 'pending' | 'approved' | 'archived'
  approvedBy?: string
  approvedAt?: string
  archivedAt?: string
  retentionPeriod?: number // 保存期限（年）
  accessLevel: 'public' | 'internal' | 'confidential' | 'secret'
  keywords: string[]
  relatedDocuments?: string[]
  version: string
  versionHistory?: VersionHistory[]
}

// 档案文件模型
export interface ArchiveFile {
  id: string
  filename: string
  originalName: string
  fileSize: number
  fileType: string
  filePath: string
  checksum?: string
  uploadedAt: string
  uploadedBy: string
}

// 版本历史模型
export interface VersionHistory {
  version: string
  changes: string
  changedBy: string
  changedAt: string
  files: ArchiveFile[]
}

// 档案资料验证规则
export const archiveMaterialValidationRules: ValidationRules = {
  title: [
    validators.required('档案标题不能为空'),
    validators.minLength(2, '档案标题至少2个字符'),
    validators.maxLength(200, '档案标题不能超过200个字符')
  ],
  description: [
    validators.required('档案描述不能为空'),
    validators.minLength(10, '档案描述至少10个字符'),
    validators.maxLength(1000, '档案描述不能超过1000个字符')
  ],
  category: [
    validators.required('档案分类不能为空')
  ],
  version: [
    validators.required('版本号不能为空'),
    validators.custom(
      (value: string) => /^v?\d+\.\d+(\.\d+)?$/.test(value),
      '版本号格式不正确，如: 1.0.0'
    )
  ]
}

// 标准规范模型
export interface Standard extends BaseModel {
  code: string // 标准编号
  title: string
  description: string
  category: string
  domain: string // 应用领域
  status: 'draft' | 'active' | 'expired' | 'superseded'
  effectiveDate: string // 生效日期
  expiryDate?: string // 失效日期
  supersededBy?: string // 被什么标准替代
  relatedStandards?: string[] // 相关标准
  fileList: ArchiveFile[]
  versionHistory: VersionHistory[]
  currentVersion: string
  language: string
  issuingOrganization: string // 发布机构
  technicalCommittee?: string // 技术委员会
  keywords: string[]
  scope?: string // 适用范围
  references?: string[] // 引用标准
}

// 标准规范验证规则
export const standardValidationRules: ValidationRules = {
  code: [
    validators.required('标准编号不能为空'),
    validators.minLength(3, '标准编号至少3个字符'),
    validators.maxLength(50, '标准编号不能超过50个字符'),
    validators.custom(
      (value: string) => /^[A-Z0-9\/\-\.]+$/i.test(value),
      '标准编号格式不正确'
    )
  ],
  title: [
    validators.required('标准名称不能为空'),
    validators.minLength(5, '标准名称至少5个字符'),
    validators.maxLength(200, '标准名称不能超过200个字符')
  ],
  description: [
    validators.required('标准描述不能为空'),
    validators.minLength(20, '标准描述至少20个字符'),
    validators.maxLength(2000, '标准描述不能超过2000个字符')
  ],
  effectiveDate: [
    validators.required('生效日期不能为空'),
    validators.date('生效日期格式不正确')
  ],
  expiryDate: [
    validators.date('失效日期格式不正确'),
    validators.custom(
      (value: string, data: any) => {
        if (!value || !data.effectiveDate) return true
        return new Date(value) > new Date(data.effectiveDate)
      },
      '失效日期必须晚于生效日期'
    )
  ],
  issuingOrganization: [
    validators.required('发布机构不能为空'),
    validators.maxLength(100, '发布机构名称不能超过100个字符')
  ]
}

// 统计分析模型
export interface StatisticsData {
  overview: {
    totalMaterials: number
    totalUsers: number
    totalDownloads: number
    totalViews: number
    completionRate: number
    activeUsers: number
  }
  trainingStats: {
    byDepartment: DepartmentStats[]
    byCategory: CategoryStats[]
    byMonth: MonthlyStats[]
    popularMaterials: PopularMaterial[]
  }
  userStats: {
    activeUsers: number
    newUsers: number
    userGrowth: number
    departmentDistribution: DepartmentDistribution[]
  }
  systemStats: {
    storageUsed: number
    bandwidthUsed: number
    apiCalls: number
    errorRate: number
  }
}

export interface DepartmentStats {
  department: string
  materialCount: number
  userCount: number
  completionRate: number
  averageScore: number
}

export interface CategoryStats {
  category: string
  count: number
  percentage: number
  trend: number
}

export interface MonthlyStats {
  month: string
  materials: number
  downloads: number
  views: number
  completions: number
}

export interface PopularMaterial {
  id: number
  title: string
  views: number
  downloads: number
  rating: number
}

export interface DepartmentDistribution {
  department: string
  count: number
  percentage: number
}

// 通知模型
export interface Notification extends BaseModel {
  title: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'training' | 'approval' | 'announcement'
  recipientId?: string
  recipientType: 'user' | 'department' | 'role' | 'all'
  isRead: boolean
  readAt?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  expiresAt?: string
  actionUrl?: string
  actionText?: string
  attachments?: string[]
}

// 通知验证规则
export const notificationValidationRules: ValidationRules = {
  title: [
    validators.required('通知标题不能为空'),
    validators.minLength(2, '通知标题至少2个字符'),
    validators.maxLength(100, '通知标题不能超过100个字符')
  ],
  content: [
    validators.required('通知内容不能为空'),
    validators.minLength(5, '通知内容至少5个字符'),
    validators.maxLength(1000, '通知内容不能超过1000个字符')
  ]
}

// 审批流程模型
export interface ApprovalFlow extends BaseModel {
  resourceType: 'training' | 'archive' | 'standard'
  resourceId: string
  currentStep: number
  totalSteps: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  steps: ApprovalStep[]
  initiator: string
  initiatedAt: string
  completedAt?: string
  comments?: string
}

export interface ApprovalStep {
  stepNumber: number
  stepName: string
  approverId: string
  approverName: string
  approverRole: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  processedAt?: string
  comments?: string
  timeLimit?: number // 审批时限（小时）
}

// 系统配置模型
export interface SystemConfig extends BaseModel {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  category: string
  description?: string
  isPublic: boolean
  defaultValue?: string
  validation?: string // 验证规则JSON
}

// 数据导出模型
export interface ExportTask extends BaseModel {
  taskName: string
  taskType: 'training' | 'archive' | 'standard' | 'user' | 'statistics'
  format: 'excel' | 'csv' | 'json' | 'pdf'
  filters?: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  fileUrl?: string
  fileSize?: number
  expiresAt?: string
  errorMessage?: string
  requestedBy: string
}

// 数据备份模型
export interface BackupRecord extends BaseModel {
  backupName: string
  backupType: 'full' | 'incremental' | 'differential'
  tables: string[]
  fileSize: number
  filePath: string
  status: 'success' | 'failed' | 'partial'
  startTime: string
  endTime?: string
  duration?: number // 秒
  errorMessage?: string
  recordCount?: number
  isAutomatic: boolean
  retentionDays: number
}

// 操作日志模型
export interface OperationLog extends BaseModel {
  userId: string
  username: string
  action: string
  resourceType: string
  resourceId?: string
  details?: any
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
  duration?: number // 毫秒
  module: string
}

// 模型工厂函数
export const createModel = <T extends BaseModel>(
  data: Partial<T>,
  defaults: Partial<T> = {}
): T => {
  const now = new Date().toISOString()
  return {
    ...defaults,
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  } as T
}

// 模型验证函数
export const validateModel = <T>(
  data: T,
  rules: ValidationRules
): { valid: boolean; errors: { [key: string]: string[] } } => {
  const errors: { [key: string]: string[] } = {}
  let valid = true

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = (data as any)[field]
    const fieldErrors: string[] = []

    for (const rule of fieldRules) {
      // 执行验证规则
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(rule.message || '此字段为必填项')
        continue
      }

      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue
      }

      if (rule.minLength !== undefined && String(value).length < rule.minLength) {
        fieldErrors.push(rule.message || `最少需要 ${rule.minLength} 个字符`)
      }

      if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
        fieldErrors.push(rule.message || `最多允许 ${rule.maxLength} 个字符`)
      }

      if (rule.pattern && !rule.pattern.test(String(value))) {
        fieldErrors.push(rule.message || '格式不正确')
      }

      if (rule.validator) {
        const result = rule.validator(value)
        if (result === false) {
          fieldErrors.push(rule.message || '验证失败')
        } else if (typeof result === 'string') {
          fieldErrors.push(result)
        }
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
      valid = false
    }
  }

  return { valid, errors }
}