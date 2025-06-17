// 响应式设计工具
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

// 断点定义
export const breakpoints = {
  xs: 480,    // 超小屏幕（手机竖屏）
  sm: 640,    // 小屏幕（手机横屏）
  md: 768,    // 中等屏幕（平板竖屏）
  lg: 1024,   // 大屏幕（平板横屏/小桌面）
  xl: 1280,   // 超大屏幕（桌面）
  xxl: 1536   // 超超大屏幕（大桌面）
} as const

export type Breakpoint = keyof typeof breakpoints

// 设备类型枚举
export enum DeviceType {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop'
}

// 屏幕方向
export enum Orientation {
  Portrait = 'portrait',
  Landscape = 'landscape'
}

// 响应式状态
export interface ResponsiveState {
  width: number
  height: number
  deviceType: DeviceType
  orientation: Orientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPortrait: boolean
  isLandscape: boolean
  currentBreakpoint: Breakpoint
  isRetina: boolean
  pixelRatio: number
}

// 创建响应式状态
const createResponsiveState = (): ResponsiveState => {
  const width = window.innerWidth
  const height = window.innerHeight
  const orientation = width > height ? Orientation.Landscape : Orientation.Portrait
  const pixelRatio = window.devicePixelRatio || 1
  
  // 确定设备类型
  let deviceType: DeviceType
  if (width < breakpoints.md) {
    deviceType = DeviceType.Mobile
  } else if (width < breakpoints.lg) {
    deviceType = DeviceType.Tablet
  } else {
    deviceType = DeviceType.Desktop
  }

  // 确定当前断点
  let currentBreakpoint: Breakpoint = 'xs'
  for (const [bp, size] of Object.entries(breakpoints)) {
    if (width >= size) {
      currentBreakpoint = bp as Breakpoint
    }
  }

  return {
    width,
    height,
    deviceType,
    orientation,
    isMobile: deviceType === DeviceType.Mobile,
    isTablet: deviceType === DeviceType.Tablet,
    isDesktop: deviceType === DeviceType.Desktop,
    isPortrait: orientation === Orientation.Portrait,
    isLandscape: orientation === Orientation.Landscape,
    currentBreakpoint,
    isRetina: pixelRatio > 1,
    pixelRatio
  }
}

// 全局响应式状态
const responsiveState = ref<ResponsiveState>(
  typeof window !== 'undefined' 
    ? createResponsiveState() 
    : {
        width: 1024,
        height: 768,
        deviceType: DeviceType.Desktop,
        orientation: Orientation.Landscape,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isPortrait: false,
        isLandscape: true,
        currentBreakpoint: 'lg' as Breakpoint,
        isRetina: false,
        pixelRatio: 1
      }
)

// 更新响应式状态
const updateResponsiveState = () => {
  if (typeof window !== 'undefined') {
    responsiveState.value = createResponsiveState()
  }
}

// 防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 防抖的更新函数
const debouncedUpdate = debounce(updateResponsiveState, 100)

// 组合式API：使用响应式设计
export const useResponsive = () => {
  const state = computed(() => responsiveState.value)
  
  // 检查是否匹配指定断点
  const matches = (breakpoint: Breakpoint) => {
    return computed(() => responsiveState.value.width >= breakpoints[breakpoint])
  }

  // 检查是否在指定断点范围内
  const between = (min: Breakpoint, max: Breakpoint) => {
    return computed(() => {
      const width = responsiveState.value.width
      return width >= breakpoints[min] && width < breakpoints[max]
    })
  }

  // 检查是否小于指定断点
  const below = (breakpoint: Breakpoint) => {
    return computed(() => responsiveState.value.width < breakpoints[breakpoint])
  }

  // 检查是否大于指定断点
  const above = (breakpoint: Breakpoint) => {
    return computed(() => responsiveState.value.width > breakpoints[breakpoint])
  }

  // 响应式值
  const responsiveValue = <T>(values: Partial<Record<Breakpoint | 'default', T>>) => {
    return computed(() => {
      const currentBreakpoint = responsiveState.value.currentBreakpoint
      
      // 按优先级查找值
      const priorities: (Breakpoint | 'default')[] = [
        currentBreakpoint,
        'default'
      ]

      // 如果当前断点没有值，向下查找
      if (!values[currentBreakpoint]) {
        const breakpointOrder: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
          const bp = breakpointOrder[i]
          if (values[bp] !== undefined) {
            return values[bp]
          }
        }
      }

      for (const priority of priorities) {
        if (values[priority] !== undefined) {
          return values[priority]
        }
      }

      return undefined
    })
  }

  return {
    state,
    matches,
    between,
    below,
    above,
    responsiveValue,
    breakpoints,
    DeviceType,
    Orientation
  }
}

// 媒体查询工具
export const createMediaQuery = (query: string) => {
  const mediaQuery = ref<MediaQueryList | null>(null)
  const matches = ref(false)

  const updateMatches = () => {
    matches.value = mediaQuery.value?.matches || false
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      mediaQuery.value = window.matchMedia(query)
      updateMatches()
      mediaQuery.value.addEventListener('change', updateMatches)
    }
  })

  onUnmounted(() => {
    if (mediaQuery.value) {
      mediaQuery.value.removeEventListener('change', updateMatches)
    }
  })

  return { matches }
}

// 预定义的媒体查询
export const useMediaQueries = () => {
  const isMobile = createMediaQuery(`(max-width: ${breakpoints.md - 1}px)`)
  const isTablet = createMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`)
  const isDesktop = createMediaQuery(`(min-width: ${breakpoints.lg}px)`)
  const isPortrait = createMediaQuery('(orientation: portrait)')
  const isLandscape = createMediaQuery('(orientation: landscape)')
  const isRetina = createMediaQuery('(-webkit-min-device-pixel-ratio: 2)')
  const prefersReducedMotion = createMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersDarkMode = createMediaQuery('(prefers-color-scheme: dark)')
  const isHighContrast = createMediaQuery('(prefers-contrast: high)')

  return {
    isMobile: isMobile.matches,
    isTablet: isTablet.matches,
    isDesktop: isDesktop.matches,
    isPortrait: isPortrait.matches,
    isLandscape: isLandscape.matches,
    isRetina: isRetina.matches,
    prefersReducedMotion: prefersReducedMotion.matches,
    prefersDarkMode: prefersDarkMode.matches,
    isHighContrast: isHighContrast.matches
  }
}

// 视口尺寸监听
export const useViewport = () => {
  const viewport = ref({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  const updateViewport = () => {
    viewport.value = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  const debouncedUpdateViewport = debounce(updateViewport, 100)

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedUpdateViewport)
      window.addEventListener('orientationchange', debouncedUpdateViewport)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', debouncedUpdateViewport)
      window.removeEventListener('orientationchange', debouncedUpdateViewport)
    }
  })

  return {
    width: computed(() => viewport.value.width),
    height: computed(() => viewport.value.height),
    aspectRatio: computed(() => viewport.value.width / viewport.value.height)
  }
}

// 容器查询（基于元素大小的响应式）
export const useContainerQuery = (containerRef: Ref<HTMLElement | null>) => {
  const containerSize = ref({ width: 0, height: 0 })
  const resizeObserver = ref<ResizeObserver | null>(null)

  const updateContainerSize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    if (entry) {
      containerSize.value = {
        width: entry.contentRect.width,
        height: entry.contentRect.height
      }
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver.value = new ResizeObserver(updateContainerSize)
      
      if (containerRef.value) {
        resizeObserver.value.observe(containerRef.value)
      }
    }
  })

  onUnmounted(() => {
    if (resizeObserver.value) {
      resizeObserver.value.disconnect()
    }
  })

  // 容器断点检查
  const containerMatches = (minWidth: number) => {
    return computed(() => containerSize.value.width >= minWidth)
  }

  return {
    containerSize: computed(() => containerSize.value),
    containerMatches
  }
}

// 设备特性检测
export const useDeviceCapabilities = () => {
  const capabilities = computed(() => {
    if (typeof window === 'undefined') {
      return {
        hasTouch: false,
        hasHover: false,
        hasPointer: false,
        isOnline: true,
        cookieEnabled: true,
        javascriptEnabled: true
      }
    }

    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      hasPointer: window.matchMedia('(pointer: fine)').matches,
      isOnline: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      javascriptEnabled: true
    }
  })

  return capabilities
}

// CSS类生成器
export const generateResponsiveClasses = (baseClass: string, responsive?: Partial<Record<Breakpoint, string>>) => {
  const classes = [baseClass]
  
  if (responsive) {
    Object.entries(responsive).forEach(([breakpoint, className]) => {
      classes.push(`${breakpoint}:${className}`)
    })
  }
  
  return classes.join(' ')
}

// 全局初始化
if (typeof window !== 'undefined') {
  // 监听窗口大小变化
  window.addEventListener('resize', debouncedUpdate)
  window.addEventListener('orientationchange', debouncedUpdate)
  
  // 清理函数
  const cleanup = () => {
    window.removeEventListener('resize', debouncedUpdate)
    window.removeEventListener('orientationchange', debouncedUpdate)
  }
  
  // 在页面卸载时清理
  window.addEventListener('beforeunload', cleanup)
}

export { responsiveState }