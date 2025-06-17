<template>
  <div class="download-icon" :class="iconClasses" @click="handleClick">
    <svg 
      viewBox="0 0 24 24" 
      :width="size" 
      :height="size"
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    
    <!-- 进度指示器 -->
    <div v-if="showProgress" class="download-progress">
      <div 
        class="download-progress-bar" 
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  color?: string
  disabled?: boolean
  loading?: boolean
  progress?: number
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  disabled: false,
  loading: false,
  progress: 0,
  showProgress: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconClasses = computed(() => ({
  'download-icon--disabled': props.disabled,
  'download-icon--loading': props.loading,
  'download-icon--with-progress': props.showProgress
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.download-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.download-icon:hover {
  color: var(--success-color);
  background-color: var(--hover-overlay);
  transform: translateY(-2px);
}

.download-icon:hover svg {
  animation: bounceIn 0.6s var(--ease-bounce);
}

.download-icon--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.download-icon--disabled:hover {
  color: var(--text-secondary);
  background-color: transparent;
  transform: none;
}

.download-icon--loading svg {
  animation: pulse 1.5s ease-in-out infinite;
}

.download-icon--with-progress {
  padding-bottom: var(--spacing-md);
}

/* 进度条 */
.download-progress {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: var(--border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.download-progress-bar {
  height: 100%;
  background: var(--gradient-success);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal) var(--ease-out-quart);
  animation: progressFill 0.3s var(--ease-out-quart);
}

/* 聚焦效果 */
.download-icon:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* 点击动画 */
.download-icon:active {
  transform: translateY(1px) scale(0.95);
}

/* 下载成功动画 */
.download-icon.success {
  color: var(--success-color);
  animation: bounceIn 0.6s var(--ease-bounce);
}
</style>