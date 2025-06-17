// 快捷键管理工具
import { ref, onMounted, onUnmounted } from 'vue'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  handler: () => void
  description?: string
}

// 全局快捷键注册表
const globalShortcuts = ref<Map<string, ShortcutConfig>>(new Map())

// 生成快捷键标识符
const generateShortcutId = (config: ShortcutConfig): string => {
  const parts = []
  if (config.ctrl) parts.push('ctrl')
  if (config.alt) parts.push('alt')
  if (config.shift) parts.push('shift')
  if (config.meta) parts.push('meta')
  parts.push(config.key.toLowerCase())
  return parts.join('+')
}

// 检查快捷键是否匹配
const isShortcutMatch = (event: KeyboardEvent, config: ShortcutConfig): boolean => {
  return (
    event.key.toLowerCase() === config.key.toLowerCase() &&
    !!event.ctrlKey === !!config.ctrl &&
    !!event.altKey === !!config.alt &&
    !!event.shiftKey === !!config.shift &&
    !!event.metaKey === !!config.meta
  )
}

// 全局键盘事件处理器
const handleGlobalKeyDown = (event: KeyboardEvent) => {
  for (const [id, config] of globalShortcuts.value) {
    if (isShortcutMatch(event, config)) {
      event.preventDefault()
      config.handler()
      break
    }
  }
}

// 注册全局快捷键
export const registerGlobalShortcut = (config: ShortcutConfig): string => {
  const id = generateShortcutId(config)
  globalShortcuts.value.set(id, config)
  return id
}

// 注销全局快捷键
export const unregisterGlobalShortcut = (id: string): void => {
  globalShortcuts.value.delete(id)
}

// 组合式API：使用快捷键
export const useShortcuts = (shortcuts: ShortcutConfig[]) => {
  const registeredIds = ref<string[]>([])

  onMounted(() => {
    // 注册快捷键
    shortcuts.forEach(shortcut => {
      const id = registerGlobalShortcut(shortcut)
      registeredIds.value.push(id)
    })

    // 添加全局监听器
    document.addEventListener('keydown', handleGlobalKeyDown)
  })

  onUnmounted(() => {
    // 注销快捷键
    registeredIds.value.forEach(id => {
      unregisterGlobalShortcut(id)
    })

    // 移除全局监听器（如果没有其他快捷键）
    if (globalShortcuts.value.size === 0) {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  })

  return {
    registeredIds: registeredIds.value
  }
}

// 常用快捷键配置
export const commonShortcuts = {
  // 保存
  save: (handler: () => void): ShortcutConfig => ({
    key: 's',
    ctrl: true,
    handler,
    description: 'Ctrl+S 保存'
  }),

  // 新建
  create: (handler: () => void): ShortcutConfig => ({
    key: 'n',
    ctrl: true,
    handler,
    description: 'Ctrl+N 新建'
  }),

  // 搜索
  search: (handler: () => void): ShortcutConfig => ({
    key: 'f',
    ctrl: true,
    handler,
    description: 'Ctrl+F 搜索'
  }),

  // 删除
  delete: (handler: () => void): ShortcutConfig => ({
    key: 'Delete',
    handler,
    description: 'Delete 删除'
  }),

  // 刷新
  refresh: (handler: () => void): ShortcutConfig => ({
    key: 'F5',
    handler,
    description: 'F5 刷新'
  }),

  // 全选
  selectAll: (handler: () => void): ShortcutConfig => ({
    key: 'a',
    ctrl: true,
    handler,
    description: 'Ctrl+A 全选'
  }),

  // 复制
  copy: (handler: () => void): ShortcutConfig => ({
    key: 'c',
    ctrl: true,
    handler,
    description: 'Ctrl+C 复制'
  }),

  // 粘贴
  paste: (handler: () => void): ShortcutConfig => ({
    key: 'v',
    ctrl: true,
    handler,
    description: 'Ctrl+V 粘贴'
  }),

  // ESC关闭
  escape: (handler: () => void): ShortcutConfig => ({
    key: 'Escape',
    handler,
    description: 'ESC 关闭'
  })
}

// 快捷键帮助信息
export const getShortcutHelp = (): ShortcutConfig[] => {
  return Array.from(globalShortcuts.value.values()).filter(config => config.description)
}