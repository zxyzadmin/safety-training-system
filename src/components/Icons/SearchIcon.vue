<template>
  <div class="search-icon" :class="iconClasses" @click="handleClick">
    <svg 
      viewBox="0 0 24 24" 
      :width="size" 
      :height="size"
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  color?: string
  active?: boolean
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  active: false,
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconClasses = computed(() => ({
  'search-icon--active': props.active,
  'search-icon--disabled': props.disabled,
  'search-icon--loading': props.loading
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.search-icon:hover {
  color: var(--primary-color);
  background-color: var(--hover-overlay);
  transform: scale(1.05);
}

.search-icon--active {
  color: var(--primary-color);
  background-color: var(--selection-bg);
}

.search-icon--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-icon--disabled:hover {
  color: var(--text-secondary);
  background-color: transparent;
  transform: none;
}

.search-icon--loading {
  animation: spin 1s linear infinite;
}

/* 聚焦效果 */
.search-icon:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* 激活状态动画 */
.search-icon--active svg {
  animation: pulse 1s ease-in-out;
}
</style>