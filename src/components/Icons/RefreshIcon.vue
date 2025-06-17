<template>
  <div class="refresh-icon" :class="iconClasses" @click="handleClick">
    <svg 
      viewBox="0 0 24 24" 
      :width="size" 
      :height="size"
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <polyline points="23,4 23,10 17,10"/>
      <polyline points="1,20 1,14 7,14"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  color?: string
  disabled?: boolean
  loading?: boolean
  autoRotate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  disabled: false,
  loading: false,
  autoRotate: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  refresh: []
}>()

const iconClasses = computed(() => ({
  'refresh-icon--disabled': props.disabled,
  'refresh-icon--loading': props.loading,
  'refresh-icon--auto-rotate': props.autoRotate
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
    emit('refresh')
  }
}
</script>

<style scoped>
.refresh-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.refresh-icon:hover {
  color: var(--primary-color);
  background-color: var(--hover-overlay);
  transform: rotate(180deg) scale(1.1);
}

.refresh-icon--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon--disabled:hover {
  color: var(--text-secondary);
  background-color: transparent;
  transform: none;
}

.refresh-icon--loading svg {
  animation: spin 1s linear infinite;
}

.refresh-icon--auto-rotate svg {
  animation: spin 3s linear infinite;
}

/* 聚焦效果 */
.refresh-icon:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* 点击动画 */
.refresh-icon:active {
  transform: rotate(360deg) scale(0.9);
}

/* 刷新成功动画 */
.refresh-icon.success {
  color: var(--success-color);
  animation: bounceIn 0.6s var(--ease-bounce);
}

/* 刷新失败动画 */
.refresh-icon.error {
  color: var(--danger-color);
  animation: shake 0.6s ease-in-out;
}
</style>