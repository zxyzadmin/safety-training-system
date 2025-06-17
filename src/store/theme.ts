import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light')
  const isDark = ref(false)

  // 获取系统主题偏好
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 应用主题
  const applyTheme = (targetTheme: 'light' | 'dark') => {
    const html = document.documentElement
    
    if (targetTheme === 'dark') {
      html.classList.add('dark')
      isDark.value = true
    } else {
      html.classList.remove('dark')
      isDark.value = false
    }
  }

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('safety_theme', newTheme)

    if (newTheme === 'auto') {
      const systemTheme = getSystemTheme()
      applyTheme(systemTheme)
      
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (theme.value === 'auto') {
          applyTheme(e.matches ? 'dark' : 'light')
        }
      })
    } else {
      applyTheme(newTheme)
    }
  }

  // 切换主题
  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('auto')
    } else {
      setTheme('light')
    }
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('safety_theme') as Theme | null
    const initialTheme = savedTheme || 'light'
    setTheme(initialTheme)
  }

  return {
    theme: readonly(theme),
    isDark: readonly(isDark),
    setTheme,
    toggleTheme,
    initTheme
  }
})