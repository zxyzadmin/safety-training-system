import { ElMessage } from 'element-plus'
import type { TrainingMaterial, StandardFile, Notification } from '@/types/common'

// 数据存储键名
const STORAGE_KEYS = {
  TRAINING_MATERIALS: 'safety_training_materials',
  STANDARD_FILES: 'safety_standard_files',
  NOTIFICATIONS: 'safety_notifications',
  DATA_VERSION: 'safety_data_version'
}

const CURRENT_VERSION = '1.0.0'

// 数据管理器类
class DataManager {
  private initialized = false

  // 初始化数据
  async init() {
    if (this.initialized) return
    
    this.checkAndMigrateData()
    this.initDefaultData()
    this.initialized = true
  }

  // 检查数据版本并迁移
  private checkAndMigrateData() {
    const version = localStorage.getItem(STORAGE_KEYS.DATA_VERSION)
    if (version !== CURRENT_VERSION) {
      console.log('数据版本更新，执行迁移...')
      // 这里可以添加数据迁移逻辑
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_VERSION)
    }
  }

  // 初始化默认数据
  private initDefaultData() {
    if (!this.getTrainingMaterials().length) {
      this.saveTrainingMaterials(this.getDefaultTrainingMaterials())
    }
    
    if (!this.getStandardFiles().length) {
      this.saveStandardFiles(this.getDefaultStandardFiles())
    }
    
    if (!this.getNotifications().length) {
      this.saveNotifications(this.getDefaultNotifications())
    }
  }

  // === 培训资料管理 ===
  getTrainingMaterials(): TrainingMaterial[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRAINING_MATERIALS)
    return data ? JSON.parse(data) : []
  }

  saveTrainingMaterials(materials: TrainingMaterial[]) {
    localStorage.setItem(STORAGE_KEYS.TRAINING_MATERIALS, JSON.stringify(materials))
  }

  addTrainingMaterial(material: Omit<TrainingMaterial, 'id' | 'createdAt'>) {
    const materials = this.getTrainingMaterials()
    const newMaterial: TrainingMaterial = {
      ...material,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    materials.push(newMaterial)
    this.saveTrainingMaterials(materials)
    return newMaterial
  }

  updateTrainingMaterial(id: number, updates: Partial<TrainingMaterial>) {
    const materials = this.getTrainingMaterials()
    const index = materials.findIndex(m => m.id === id)
    if (index > -1) {
      materials[index] = { ...materials[index], ...updates, updatedAt: new Date().toISOString() }
      this.saveTrainingMaterials(materials)
      return materials[index]
    }
    return null
  }

  deleteTrainingMaterial(id: number) {
    const materials = this.getTrainingMaterials()
    const filtered = materials.filter(m => m.id !== id)
    this.saveTrainingMaterials(filtered)
    return filtered.length < materials.length
  }

  batchDeleteTrainingMaterials(ids: number[]) {
    const materials = this.getTrainingMaterials()
    const filtered = materials.filter(m => !ids.includes(m.id))
    this.saveTrainingMaterials(filtered)
    return materials.length - filtered.length
  }

  // === 标准文件管理 ===
  getStandardFiles(): StandardFile[] {
    const data = localStorage.getItem(STORAGE_KEYS.STANDARD_FILES)
    return data ? JSON.parse(data) : []
  }

  saveStandardFiles(files: StandardFile[]) {
    localStorage.setItem(STORAGE_KEYS.STANDARD_FILES, JSON.stringify(files))
  }

  // === 通知管理 ===
  getNotifications(): Notification[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    return data ? JSON.parse(data) : []
  }

  saveNotifications(notifications: Notification[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
  }

  // === 数据导入导出 ===
  async exportData(type: 'all' | 'training' | 'standards' = 'all') {
    const data: any = {
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      type
    }

    switch (type) {
      case 'training':
        data.trainingMaterials = this.getTrainingMaterials()
        break
      case 'standards':
        data.standardFiles = this.getStandardFiles()
        break
      case 'all':
      default:
        data.trainingMaterials = this.getTrainingMaterials()
        data.standardFiles = this.getStandardFiles()
        data.notifications = this.getNotifications()
        break
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `safety-training-data-${type}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('数据导出成功')
  }

  async importData(file: File) {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          
          if (!data.version || !data.exportDate) {
            throw new Error('无效的数据文件格式')
          }

          if (data.trainingMaterials) {
            this.saveTrainingMaterials(data.trainingMaterials)
          }
          
          if (data.standardFiles) {
            this.saveStandardFiles(data.standardFiles)
          }
          
          if (data.notifications) {
            this.saveNotifications(data.notifications)
          }

          ElMessage.success('数据导入成功')
          resolve()
        } catch (error) {
          ElMessage.error('数据导入失败：' + (error as Error).message)
          reject(error)
        }
      }

      reader.onerror = () => {
        ElMessage.error('文件读取失败')
        reject(new Error('文件读取失败'))
      }

      reader.readAsText(file)
    })
  }

  // 导出为Excel格式
  async exportToExcel(type: 'training' | 'standards') {
    const XLSX = await import('xlsx')
    
    let data: any[] = []
    let filename = ''

    if (type === 'training') {
      data = this.getTrainingMaterials().map(item => ({
        '标题': item.title,
        '内容': item.content,
        '主题': item.topic,
        '时长': item.duration + '课时',
        '讲师': item.instructor,
        '部门': item.department,
        '状态': this.getStatusText(item.status),
        '上传者': item.username,
        '浏览量': item.viewCount,
        '下载量': item.downloadCount,
        '标签': item.tags.join(', '),
        '创建时间': new Date(item.createdAt).toLocaleString('zh-CN')
      }))
      filename = `培训资料数据-${new Date().toISOString().split('T')[0]}.xlsx`
    } else {
      data = this.getStandardFiles().map(item => ({
        '标题': item.title,
        '描述': item.description,
        '分类': item.category,
        '版本': item.version,
        '上传者': item.uploader,
        '部门': item.department,
        '状态': item.status,
        '下载量': item.downloadCount,
        '生效日期': new Date(item.effectiveDate).toLocaleDateString('zh-CN'),
        '过期日期': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('zh-CN') : '无',
        '标签': item.tags.join(', '),
        '创建时间': new Date(item.createdAt).toLocaleString('zh-CN')
      }))
      filename = `标准文件数据-${new Date().toISOString().split('T')[0]}.xlsx`
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'training' ? '培训资料' : '标准文件')
    
    // 设置列宽
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }))
    worksheet['!cols'] = colWidths
    
    XLSX.writeFile(workbook, filename)
    ElMessage.success('Excel文件导出成功')
  }

  // === 统计数据 ===
  getStatistics() {
    const materials = this.getTrainingMaterials()
    const files = this.getStandardFiles()
    
    return {
      totalTrainings: materials.length,
      approvedTrainings: materials.filter(m => m.status === 'approved').length,
      pendingTrainings: materials.filter(m => m.status === 'pending').length,
      totalStandards: files.length,
      activeStandards: files.filter(f => f.status === 'active').length,
      totalDownloads: materials.reduce((sum, m) => sum + m.downloadCount, 0),
      totalViews: materials.reduce((sum, m) => sum + m.viewCount, 0),
      departmentStats: this.getDepartmentStats(materials),
      monthlyStats: this.getMonthlyStats(materials),
      topicStats: this.getTopicStats(materials)
    }
  }

  // === 工具方法 ===
  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000)
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝'
    }
    return statusMap[status] || status
  }

  private getDepartmentStats(materials: TrainingMaterial[]) {
    const stats: Record<string, any> = {}
    
    materials.forEach(material => {
      if (!stats[material.department]) {
        stats[material.department] = {
          department: material.department,
          trainingCount: 0,
          totalHours: 0,
          downloads: 0,
          views: 0
        }
      }
      
      stats[material.department].trainingCount++
      stats[material.department].totalHours += material.duration
      stats[material.department].downloads += material.downloadCount
      stats[material.department].views += material.viewCount
    })
    
    return Object.values(stats)
  }

  private getMonthlyStats(materials: TrainingMaterial[]) {
    const stats: Record<string, any> = {}
    
    materials.forEach(material => {
      const month = new Date(material.createdAt).toISOString().slice(0, 7)
      if (!stats[month]) {
        stats[month] = {
          month,
          trainingCount: 0,
          totalHours: 0
        }
      }
      
      stats[month].trainingCount++
      stats[month].totalHours += material.duration
    })
    
    return Object.values(stats).sort((a: any, b: any) => a.month.localeCompare(b.month))
  }

  private getTopicStats(materials: TrainingMaterial[]) {
    const stats: Record<string, number> = {}
    const total = materials.length
    
    materials.forEach(material => {
      stats[material.topic] = (stats[material.topic] || 0) + 1
    })
    
    return Object.entries(stats).map(([topic, count]) => ({
      topic,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count)
  }

  // 默认数据生成器
  private getDefaultTrainingMaterials(): TrainingMaterial[] {
    return [
      {
        id: 1,
        title: '消防安全知识培训',
        content: '包含消防安全基础知识、火灾预防、逃生技巧等重要内容。适用于全体员工的基础安全培训，涵盖火灾类型识别、灭火器使用方法、疏散程序等关键知识点。',
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
        tags: ['消防', '安全', '基础培训', '应急处理'],
        createdAt: '2024-01-08T09:00:00Z'
      },
      {
        id: 2,
        title: '工作安全规范操作指南',
        content: '详细介绍各工种的安全操作规范，包括设备使用、防护措施、应急处理等内容。涵盖机械操作安全、化学品处理、个人防护设备使用等多个方面。',
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
        tags: ['操作规范', '安全防护', '设备操作'],
        createdAt: '2024-01-12T14:30:00Z'
      },
      {
        id: 3,
        title: '电气安全培训教程',
        content: '电气设备安全使用、电击防护、电气火灾预防等专业内容。包括电气系统基础知识、安全操作程序、故障排除方法等。',
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
        tags: ['电气安全', '专业培训', '设备维护'],
        createdAt: '2024-01-02T11:15:00Z'
      },
      {
        id: 4,
        title: '化学品安全管理',
        content: '化学品的正确存储、使用和处置方法，包括MSDS解读、泄漏应急处理、个人防护等内容。',
        filename: 'chemical_safety.pdf',
        fileSize: 2560000,
        fileType: 'pdf',
        topic: '化学安全',
        duration: 5,
        instructor: '陈化工',
        department: '技术部',
        username: 'admin',
        status: 'approved',
        approvedBy: 'admin',
        approvedAt: '2024-01-15T09:30:00Z',
        downloadCount: 92,
        viewCount: 167,
        tags: ['化学安全', 'MSDS', '应急处理'],
        createdAt: '2024-01-13T16:45:00Z'
      },
      {
        id: 5,
        title: '高空作业安全培训',
        content: '高空作业安全规范、防坠落设备使用、作业许可制度等内容。适用于需要进行高空作业的人员。',
        filename: 'height_work_safety.pptx',
        fileSize: 4096000,
        fileType: 'pptx',
        topic: '高空作业',
        duration: 4,
        instructor: '赵高空',
        department: '安全科',
        username: 'admin',
        status: 'draft',
        downloadCount: 23,
        viewCount: 45,
        tags: ['高空作业', '防坠落', '许可制度'],
        createdAt: '2024-01-16T10:20:00Z'
      }
    ]
  }

  private getDefaultStandardFiles(): StandardFile[] {
    return [
      {
        id: 1,
        title: '企业安全生产标准操作程序',
        description: '详细规定了企业各岗位的安全操作程序和标准',
        filename: 'safety_sop.pdf',
        fileSize: 1024000,
        fileType: 'pdf',
        category: '操作规程',
        version: 'v2.1',
        uploader: 'admin',
        department: '安全科',
        status: 'active',
        downloadCount: 234,
        effectiveDate: '2024-01-01T00:00:00Z',
        expiryDate: '2024-12-31T23:59:59Z',
        tags: ['SOP', '标准程序'],
        createdAt: '2023-12-15T14:30:00Z'
      }
    ]
  }

  private getDefaultNotifications(): Notification[] {
    return [
      {
        id: 1,
        title: '系统更新通知',
        content: '安全培训系统已更新至v2.0版本，新增了PWA支持和离线功能。',
        type: 'info',
        recipient: 'all',
        sender: 'system',
        isRead: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
      }
    ]
  }
}

// 单例模式
export const dataManager = new DataManager()
export default dataManager