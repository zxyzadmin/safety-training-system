<template>
  <div 
    ref="containerRef"
    class="lazy-load-container"
    :class="{ 'is-loading': isLoading, 'is-loaded': isLoaded }"
  >
    <!-- 加载状态 -->
    <div v-if="showPlaceholder" class="lazy-placeholder">
      <slot name="placeholder">
        <div class="default-placeholder">
          <div class="placeholder-skeleton">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-text"></div>
            <div class="skeleton-line skeleton-text short"></div>
          </div>
        </div>
      </slot>
    </div>

    <!-- 实际内容 -->
    <div 
      v-show="!showPlaceholder" 
      class="lazy-content"
      :class="{ 'fade-in': isLoaded }"
    >
      <slot :is-loading="isLoading" :is-loaded="isLoaded" />
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError" class="lazy-error">
      <slot name="error" :retry="retry" :error="error">
        <div class="default-error">
          <el-icon class="error-icon"><Warning /></el-icon>
          <p class="error-message">{{ error?.message || '加载失败' }}</p>
          <el-button size="small" @click="retry">重试</el-button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Warning } from '@element-plus/icons-vue'

interface Props {
  // 懒加载触发距离（像素）
  threshold?: number
  // 根边距
  rootMargin?: string
  // 是否只触发一次
  once?: boolean
  // 是否立即加载（不等待进入视窗）
  immediate?: boolean
  // 延迟时间（毫秒）
  delay?: number
  // 是否显示骨架屏
  showSkeleton?: boolean
  // 禁用懒加载
  disabled?: boolean
  // 自定义根元素
  root?: Element | null
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 0.1,
  rootMargin: '50px',
  once: true,
  immediate: false,
  delay: 0,
  showSkeleton: true,
  disabled: false,
  root: null
})

const emit = defineEmits<{
  enter: [target: Element]
  leave: [target: Element]
  load: []
  error: [error: Error]
}>()

const containerRef = ref<HTMLElement>()
const isVisible = ref(false)
const isLoading = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const error = ref<Error | null>(null)

let observer: IntersectionObserver | null = null
let loadTimer: NodeJS.Timeout | null = null

// 是否显示占位符
const showPlaceholder = computed(() => {
  return props.showSkeleton && !isLoaded.value && !hasError.value
})

// 创建 Intersection Observer
const createObserver = () => {
  if (!containerRef.value || props.disabled) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          emit('enter', entry.target)
          
          if (!isLoaded.value) {
            triggerLoad()
          }
          
          // 如果只触发一次，则在触发后断开观察
          if (props.once) {
            observer?.unobserve(entry.target)
          }
        } else {
          isVisible.value = false
          emit('leave', entry.target)
        }
      })
    },
    {
      root: props.root,
      rootMargin: props.rootMargin,
      threshold: props.threshold
    }
  )

  observer.observe(containerRef.value)
}

// 触发加载
const triggerLoad = () => {
  if (isLoading.value || isLoaded.value) return

  isLoading.value = true
  hasError.value = false
  error.value = null

  const load = () => {
    try {
      emit('load')
      isLoaded.value = true
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('加载失败'))
    } finally {
      isLoading.value = false
    }
  }

  if (props.delay > 0) {
    loadTimer = setTimeout(load, props.delay)
  } else {
    load()
  }
}

// 处理错误
const handleError = (err: Error) => {
  hasError.value = true
  error.value = err
  isLoading.value = false
  emit('error', err)
}

// 重试加载
const retry = () => {
  hasError.value = false
  error.value = null
  triggerLoad()
}

// 手动触发加载
const forceLoad = () => {
  triggerLoad()
}

// 重置状态
const reset = () => {
  isVisible.value = false
  isLoading.value = false
  isLoaded.value = false
  hasError.value = false
  error.value = null
  
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
}

// 监听 disabled 属性变化
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    observer?.disconnect()
    observer = null
  } else {
    createObserver()
  }
})

// 监听 immediate 属性
watch(() => props.immediate, (immediate) => {
  if (immediate && !isLoaded.value) {
    triggerLoad()
  }
})

onMounted(() => {
  if (props.immediate) {
    triggerLoad()
  } else if (!props.disabled) {
    createObserver()
  }
})

onUnmounted(() => {
  observer?.disconnect()
  if (loadTimer) {
    clearTimeout(loadTimer)
  }
})

// 暴露方法
defineExpose({
  forceLoad,
  reset,
  retry,
  isVisible: () => isVisible.value,
  isLoading: () => isLoading.value,
  isLoaded: () => isLoaded.value,
  hasError: () => hasError.value
})
</script>

<style scoped>
.lazy-load-container {
  position: relative;
  width: 100%;
  min-height: 50px;
}

.lazy-placeholder {
  width: 100%;
  padding: var(--spacing-lg);
}

.default-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.placeholder-skeleton {
  width: 100%;
  max-width: 300px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-sm);
  animation: skeletonLoading 1.5s ease-in-out infinite;
}

.skeleton-title {
  height: 20px;
  margin-bottom: var(--spacing-md);
}

.skeleton-text.short {
  width: 60%;
}

@keyframes skeletonLoading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.lazy-content {
  width: 100%;
  opacity: 0;
  transition: opacity var(--transition-normal) ease-in-out;
}

.lazy-content.fade-in {
  opacity: 1;
}

.lazy-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: var(--spacing-lg);
}

.default-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
}

.error-icon {
  font-size: 32px;
  color: var(--warning-color);
}

.error-message {
  font-size: var(--font-sm);
  margin: 0;
}

/* 加载状态样式 */
.lazy-load-container.is-loading {
  pointer-events: none;
}

.lazy-load-container.is-loading .lazy-content {
  opacity: 0.6;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .lazy-placeholder {
    padding: var(--spacing-md);
  }
  
  .skeleton-line {
    height: 14px;
  }
  
  .skeleton-title {
    height: 18px;
  }
}

/* 减少动画（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  .skeleton-line {
    animation: none;
    background: var(--bg-secondary);
  }
  
  .lazy-content {
    transition: none;
  }
}
</style>