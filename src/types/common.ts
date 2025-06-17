export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt?: string
}

export interface TrainingMaterial extends BaseEntity {
  title: string
  content: string
  filename: string
  fileSize: number
  fileType: string
  topic: string
  duration: number // 课时
  instructor: string // 讲师
  department: string
  username: string // 上传者
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  downloadCount: number
  viewCount: number
  tags: string[]
}

export interface StandardFile extends BaseEntity {
  title: string
  description: string
  filename: string
  fileSize: number
  fileType: string
  category: string
  version: string
  uploader: string
  department: string
  status: 'active' | 'archived' | 'draft'
  downloadCount: number
  effectiveDate: string
  expiryDate?: string
  tags: string[]
}

export interface Notification extends BaseEntity {
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  recipient: string // 接收者用户名
  sender?: string // 发送者用户名
  isRead: boolean
  readAt?: string
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
}

export interface ApprovalComment extends BaseEntity {
  materialId: number
  approver: string
  comment: string
  action: 'approve' | 'reject' | 'comment'
  status: 'pending' | 'completed'
}

export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface SearchFilters {
  keyword?: string
  department?: string
  status?: string
  category?: string
  dateRange?: [string, string]
  tags?: string[]
}

export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface StatisticsData {
  totalTrainings: number
  totalHours: number
  totalParticipants: number
  completionRate: number
  departmentStats: DepartmentStat[]
  monthlyStats: MonthlyStat[]
  topicStats: TopicStat[]
}

export interface DepartmentStat {
  department: string
  trainingCount: number
  totalHours: number
  participantCount: number
  completionRate: number
}

export interface MonthlyStat {
  month: string
  trainingCount: number
  participantCount: number
  totalHours: number
}

export interface TopicStat {
  topic: string
  count: number
  percentage: number
}