// 数据验证工具
import { ref, computed } from 'vue'

// 验证规则类型
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
  message?: string
}

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

export interface ValidationResult {
  valid: boolean
  errors: { [key: string]: string[] }
}

// 内置验证规则
export const validators = {
  // 必填项验证
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || '此字段为必填项'
  }),

  // 长度验证
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `最少需要 ${min} 个字符`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `最多允许 ${max} 个字符`
  }),

  // 邮箱验证
  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || '请输入有效的邮箱地址'
  }),

  // 手机号验证
  phone: (message?: string): ValidationRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message: message || '请输入有效的手机号码'
  }),

  // 身份证验证
  idCard: (message?: string): ValidationRule => ({
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message: message || '请输入有效的身份证号码'
  }),

  // 密码强度验证
  strongPassword: (message?: string): ValidationRule => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: message || '密码必须包含大小写字母、数字和特殊字符，至少8位'
  }),

  // 文件大小验证 (MB)
  fileSize: (maxSizeMB: number, message?: string): ValidationRule => ({
    validator: (file: File) => {
      if (!file) return true
      const maxSize = maxSizeMB * 1024 * 1024
      return file.size <= maxSize
    },
    message: message || `文件大小不能超过 ${maxSizeMB}MB`
  }),

  // 文件类型验证
  fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
    validator: (file: File) => {
      if (!file) return true
      return allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        } else if (type.includes('/')) {
          return file.type === type
        } else {
          return file.type.startsWith(type + '/')
        }
      })
    },
    message: message || `只允许上传 ${allowedTypes.join(', ')} 格式的文件`
  }),

  // 数字范围验证
  range: (min: number, max: number, message?: string): ValidationRule => ({
    validator: (value: number) => {
      const num = Number(value)
      return !isNaN(num) && num >= min && num <= max
    },
    message: message || `数值必须在 ${min} 到 ${max} 之间`
  }),

  // 日期验证
  date: (message?: string): ValidationRule => ({
    validator: (value: string | Date) => {
      if (!value) return true
      const date = new Date(value)
      return !isNaN(date.getTime())
    },
    message: message || '请输入有效的日期'
  }),

  // 未来日期验证
  futureDate: (message?: string): ValidationRule => ({
    validator: (value: string | Date) => {
      if (!value) return true
      const date = new Date(value)
      return date > new Date()
    },
    message: message || '日期必须是未来时间'
  }),

  // URL验证
  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.]*))?(?:\#(?:[\w.]*))?)?$/,
    message: message || '请输入有效的URL地址'
  }),

  // 自定义验证器
  custom: (validator: (value: any) => boolean | string, message?: string): ValidationRule => ({
    validator,
    message: message || '验证失败'
  })
}

// 执行单个验证规则
const validateRule = (value: any, rule: ValidationRule): string | null => {
  // 必填项验证
  if (rule.required && (value === undefined || value === null || value === '')) {
    return rule.message || '此字段为必填项'
  }

  // 如果值为空且不是必填项，跳过其他验证
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return null
  }

  // 最小长度验证
  if (rule.minLength !== undefined && String(value).length < rule.minLength) {
    return rule.message || `最少需要 ${rule.minLength} 个字符`
  }

  // 最大长度验证
  if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
    return rule.message || `最多允许 ${rule.maxLength} 个字符`
  }

  // 正则表达式验证
  if (rule.pattern && !rule.pattern.test(String(value))) {
    return rule.message || '格式不正确'
  }

  // 自定义验证器
  if (rule.validator) {
    const result = rule.validator(value)
    if (result === false) {
      return rule.message || '验证失败'
    } else if (typeof result === 'string') {
      return result
    }
  }

  return null
}

// 验证单个字段
export const validateField = (value: any, rules: ValidationRule[]): string[] => {
  const errors: string[] = []
  
  for (const rule of rules) {
    const error = validateRule(value, rule)
    if (error) {
      errors.push(error)
    }
  }
  
  return errors
}

// 验证表单数据
export const validateForm = (data: any, rules: ValidationRules): ValidationResult => {
  const errors: { [key: string]: string[] } = {}
  let valid = true

  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldErrors = validateField(data[field], fieldRules)
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
      valid = false
    }
  }

  return { valid, errors }
}

// 组合式API：使用表单验证
export const useFormValidation = (initialData: any, rules: ValidationRules) => {
  const formData = ref({ ...initialData })
  const errors = ref<{ [key: string]: string[] }>({})
  const touched = ref<{ [key: string]: boolean }>({})

  // 验证单个字段
  const validateSingleField = (field: string) => {
    const fieldRules = rules[field]
    if (fieldRules) {
      const fieldErrors = validateField(formData.value[field], fieldRules)
      if (fieldErrors.length > 0) {
        errors.value[field] = fieldErrors
      } else {
        delete errors.value[field]
      }
    }
  }

  // 验证整个表单
  const validate = (): boolean => {
    const result = validateForm(formData.value, rules)
    errors.value = result.errors
    return result.valid
  }

  // 清除字段错误
  const clearFieldError = (field: string) => {
    delete errors.value[field]
  }

  // 清除所有错误
  const clearErrors = () => {
    errors.value = {}
  }

  // 标记字段为已触碰
  const touchField = (field: string) => {
    touched.value[field] = true
  }

  // 重置表单
  const resetForm = () => {
    formData.value = { ...initialData }
    errors.value = {}
    touched.value = {}
  }

  // 是否有错误
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  // 是否表单有效
  const isValid = computed(() => !hasErrors.value)

  // 获取字段错误
  const getFieldError = (field: string) => {
    return errors.value[field]?.[0] || ''
  }

  // 字段是否有错误
  const hasFieldError = (field: string) => {
    return !!(errors.value[field] && errors.value[field].length > 0)
  }

  return {
    formData,
    errors,
    touched,
    hasErrors,
    isValid,
    validate,
    validateSingleField,
    clearFieldError,
    clearErrors,
    touchField,
    resetForm,
    getFieldError,
    hasFieldError
  }
}

// 常用验证规则组合
export const commonRules = {
  // 用户名规则
  username: [
    validators.required('用户名不能为空'),
    validators.minLength(3, '用户名至少3个字符'),
    validators.maxLength(20, '用户名不能超过20个字符'),
    validators.custom(
      (value: string) => /^[a-zA-Z0-9_]+$/.test(value),
      '用户名只能包含字母、数字和下划线'
    )
  ],

  // 邮箱规则
  email: [
    validators.required('邮箱不能为空'),
    validators.email('邮箱格式不正确')
  ],

  // 密码规则
  password: [
    validators.required('密码不能为空'),
    validators.minLength(6, '密码至少6个字符'),
    validators.maxLength(50, '密码不能超过50个字符')
  ],

  // 强密码规则
  strongPassword: [
    validators.required('密码不能为空'),
    validators.strongPassword()
  ],

  // 手机号规则
  phone: [
    validators.required('手机号不能为空'),
    validators.phone('手机号格式不正确')
  ],

  // 文件上传规则
  file: [
    validators.required('请选择文件'),
    validators.fileSize(10, '文件大小不能超过10MB'),
    validators.fileType(['.pdf', '.doc', '.docx', '.ppt', '.pptx'], '只支持文档格式')
  ],

  // 标题规则
  title: [
    validators.required('标题不能为空'),
    validators.minLength(2, '标题至少2个字符'),
    validators.maxLength(100, '标题不能超过100个字符')
  ],

  // 内容规则
  content: [
    validators.required('内容不能为空'),
    validators.minLength(10, '内容至少10个字符'),
    validators.maxLength(5000, '内容不能超过5000个字符')
  ]
}