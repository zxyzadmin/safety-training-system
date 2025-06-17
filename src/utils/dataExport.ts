// 数据导入导出工具
import * as XLSX from 'xlsx'

// 支持的导出格式
export type ExportFormat = 'excel' | 'csv' | 'json' | 'txt'

// 导出选项
export interface ExportOptions {
  filename?: string
  sheetName?: string
  headers?: string[]
  format?: ExportFormat
  dateFormat?: string
  encoding?: string
}

// Excel列配置
export interface ExcelColumn {
  key: string
  title: string
  width?: number
  type?: 'string' | 'number' | 'date' | 'boolean'
  format?: string
}

// 导出到Excel
export const exportToExcel = (
  data: any[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
) => {
  const {
    filename = 'export',
    sheetName = 'Sheet1',
    dateFormat = 'YYYY-MM-DD HH:mm:ss'
  } = options

  // 创建工作簿
  const workbook = XLSX.utils.book_new()

  // 准备数据
  const exportData = data.map(item => {
    const row: any = {}
    columns.forEach(col => {
      let value = getNestedValue(item, col.key)
      
      // 格式化数据
      if (value !== null && value !== undefined) {
        switch (col.type) {
          case 'date':
            value = formatDate(value, dateFormat)
            break
          case 'boolean':
            value = value ? '是' : '否'
            break
          case 'number':
            value = Number(value)
            break
          default:
            value = String(value)
        }
      } else {
        value = ''
      }
      
      row[col.title] = value
    })
    return row
  })

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // 设置列宽
  const colWidths = columns.map(col => ({
    wch: col.width || Math.max(col.title.length * 2, 10)
  }))
  worksheet['!cols'] = colWidths

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // 导出文件
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// 导出到CSV
export const exportToCSV = (
  data: any[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
) => {
  const {
    filename = 'export',
    encoding = 'utf-8'
  } = options

  // 准备标题行
  const headers = columns.map(col => col.title)
  
  // 准备数据行
  const rows = data.map(item => {
    return columns.map(col => {
      let value = getNestedValue(item, col.key)
      
      if (value !== null && value !== undefined) {
        // 处理包含逗号、换行符或引号的值
        value = String(value)
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`
        }
      } else {
        value = ''
      }
      
      return value
    })
  })

  // 组合CSV内容
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  // 添加BOM以支持中文
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csvContent

  // 创建并下载文件
  downloadTextFile(csvWithBOM, `${filename}.csv`, 'text/csv;charset=utf-8')
}

// 导出到JSON
export const exportToJSON = (
  data: any[],
  columns?: ExcelColumn[],
  options: ExportOptions = {}
) => {
  const { filename = 'export' } = options

  let exportData = data
  
  // 如果指定了列配置，只导出指定字段
  if (columns) {
    exportData = data.map(item => {
      const filteredItem: any = {}
      columns.forEach(col => {
        filteredItem[col.key] = getNestedValue(item, col.key)
      })
      return filteredItem
    })
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadTextFile(jsonContent, `${filename}.json`, 'application/json')
}

// 导出到TXT
export const exportToTXT = (
  data: any[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
) => {
  const { filename = 'export' } = options

  // 计算每列的最大宽度
  const columnWidths = columns.map(col => {
    const maxDataWidth = Math.max(
      ...data.map(item => String(getNestedValue(item, col.key) || '').length)
    )
    return Math.max(col.title.length, maxDataWidth, 8)
  })

  // 创建标题行
  const headerLine = columns
    .map((col, index) => col.title.padEnd(columnWidths[index]))
    .join(' | ')
  
  // 创建分隔线
  const separatorLine = columnWidths
    .map(width => '-'.repeat(width))
    .join('-+-')

  // 创建数据行
  const dataLines = data.map(item => {
    return columns
      .map((col, index) => {
        const value = String(getNestedValue(item, col.key) || '')
        return value.padEnd(columnWidths[index])
      })
      .join(' | ')
  })

  // 组合所有行
  const txtContent = [headerLine, separatorLine, ...dataLines].join('\n')
  
  downloadTextFile(txtContent, `${filename}.txt`, 'text/plain')
}

// 批量导出函数
export const exportData = (
  data: any[],
  columns: ExcelColumn[],
  format: ExportFormat,
  options: ExportOptions = {}
) => {
  switch (format) {
    case 'excel':
      exportToExcel(data, columns, options)
      break
    case 'csv':
      exportToCSV(data, columns, options)
      break
    case 'json':
      exportToJSON(data, columns, options)
      break
    case 'txt':
      exportToTXT(data, columns, options)
      break
    default:
      throw new Error(`不支持的导出格式: ${format}`)
  }
}

// 从Excel导入数据
export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 读取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(new Error('Excel文件解析失败: ' + error))
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 从CSV导入数据
export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length === 0) {
          resolve([])
          return
        }
        
        // 解析标题行
        const headers = parseCSVLine(lines[0])
        
        // 解析数据行
        const data = lines.slice(1).map(line => {
          const values = parseCSVLine(line)
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          return row
        })
        
        resolve(data)
      } catch (error) {
        reject(new Error('CSV文件解析失败: ' + error))
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'utf-8')
  })
}

// 从JSON导入数据
export const importFromJSON = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)
        
        if (Array.isArray(data)) {
          resolve(data)
        } else {
          resolve([data])
        }
      } catch (error) {
        reject(new Error('JSON文件解析失败: ' + error))
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'utf-8')
  })
}

// 通用导入函数
export const importData = (file: File): Promise<any[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return importFromExcel(file)
    case 'csv':
      return importFromCSV(file)
    case 'json':
      return importFromJSON(file)
    default:
      return Promise.reject(new Error(`不支持的文件格式: ${extension}`))
  }
}

// 数据模板生成
export const generateTemplate = (
  columns: ExcelColumn[],
  format: ExportFormat = 'excel',
  options: ExportOptions = {}
) => {
  const templateData = [{}] // 空数据行作为模板
  
  // 为每一列添加示例数据
  columns.forEach(col => {
    templateData[0][col.key] = getExampleValue(col.type)
  })
  
  exportData(templateData, columns, format, {
    ...options,
    filename: options.filename || 'template'
  })
}

// 辅助函数

// 获取嵌套对象值
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

// 格式化日期
const formatDate = (date: any, format: string): string => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  
  // 简单的日期格式化
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 下载文本文件
const downloadTextFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// 解析CSV行
const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // 跳过下一个引号
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// 获取示例值
const getExampleValue = (type?: string): string => {
  switch (type) {
    case 'number':
      return '123'
    case 'date':
      return '2024-01-01'
    case 'boolean':
      return '是'
    default:
      return '示例文本'
  }
}

// 预定义列配置
export const commonColumns = {
  // 用户列配置
  user: [
    { key: 'username', title: '用户名', width: 15 },
    { key: 'name', title: '姓名', width: 15 },
    { key: 'email', title: '邮箱', width: 25 },
    { key: 'phone', title: '手机号', width: 15 },
    { key: 'department', title: '部门', width: 15 },
    { key: 'role', title: '角色', width: 10 },
    { key: 'status', title: '状态', width: 10 },
    { key: 'createdAt', title: '创建时间', width: 20, type: 'date' as const }
  ],

  // 培训资料列配置
  training: [
    { key: 'title', title: '标题', width: 30 },
    { key: 'topic', title: '主题', width: 15 },
    { key: 'instructor', title: '讲师', width: 15 },
    { key: 'department', title: '部门', width: 15 },
    { key: 'duration', title: '时长(课时)', width: 12, type: 'number' as const },
    { key: 'status', title: '状态', width: 10 },
    { key: 'downloadCount', title: '下载次数', width: 12, type: 'number' as const },
    { key: 'viewCount', title: '查看次数', width: 12, type: 'number' as const },
    { key: 'createdAt', title: '创建时间', width: 20, type: 'date' as const }
  ],

  // 档案资料列配置
  archive: [
    { key: 'title', title: '标题', width: 30 },
    { key: 'category', title: '分类', width: 15 },
    { key: 'subcategory', title: '子分类', width: 15 },
    { key: 'version', title: '版本', width: 10 },
    { key: 'accessLevel', title: '访问级别', width: 12 },
    { key: 'status', title: '状态', width: 10 },
    { key: 'retentionPeriod', title: '保存期限', width: 12, type: 'number' as const },
    { key: 'createdAt', title: '创建时间', width: 20, type: 'date' as const }
  ]
}