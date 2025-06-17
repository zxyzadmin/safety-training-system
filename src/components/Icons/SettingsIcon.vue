<template>
  <div class="settings-icon" :class="iconClasses" @click="handleClick">
    <svg 
      viewBox="0 0 24 24" 
      :width="size" 
      :height="size"
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1M19.07 4.93l-4.24 4.24m0 5.66l4.24 4.24M4.93 4.93l4.24 4.24m0 5.66l-4.24 4.24"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  color?: string
  spinning?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  spinning: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconClasses = computed(() => ({
  'settings-icon--spinning': props.spinning,
  'settings-icon--disabled': props.disabled
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.settings-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.settings-icon:hover {
  color: var(--primary-color);
  background-color: var(--hover-overlay);
  transform: rotate(45deg) scale(1.1);
}

.settings-icon--spinning svg {
  animation: spin 2s linear infinite;
}

.settings-icon--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-icon--disabled:hover {
  color: var(--text-secondary);
  background-color: transparent;
  transform: none;
}

/* 聚焦效果 */
.settings-icon:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* 点击动画 */
.settings-icon:active {
  transform: rotate(90deg) scale(0.95);
}
</style>