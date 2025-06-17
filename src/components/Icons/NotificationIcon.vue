<template>
  <div class="notification-icon" :class="iconClasses" @click="handleClick">
    <svg 
      viewBox="0 0 24 24" 
      :width="size" 
      :height="size"
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    
    <!-- 通知徽章 -->
    <div 
      v-if="badge && badgeCount > 0" 
      class="notification-badge"
      :class="{ 'bounce-in': animated && badgeCount > 0 }"
    >
      {{ badgeCount > 99 ? '99+' : badgeCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  color?: string
  badge?: boolean
  badgeCount?: number
  animated?: boolean
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  badge: false,
  badgeCount: 0,
  animated: true,
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconClasses = computed(() => ({
  'notification-icon--disabled': props.disabled,
  'notification-icon--loading': props.loading,
  'notification-icon--has-badge': props.badge && props.badgeCount > 0,
  'wiggle': props.animated && props.badgeCount > 0
}))

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.notification-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.notification-icon:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

.notification-icon--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notification-icon--disabled:hover {
  color: var(--text-secondary);
  transform: none;
}

.notification-icon--loading {
  animation: pulse 1.5s ease-in-out infinite;
}

.notification-icon--has-badge:hover {
  animation: wiggle 0.6s ease-in-out;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--danger-color);
  color: var(--text-white);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: var(--font-bold);
  line-height: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

.notification-badge.bounce-in {
  animation: bounceIn 0.6s var(--ease-bounce) forwards;
}

/* 深色模式适配 */
html.dark .notification-badge {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}
</style>