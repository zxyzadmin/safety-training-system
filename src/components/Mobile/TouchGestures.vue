<template>
  <div
    ref="gestureContainer"
    class="touch-gesture-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <slot 
      :gesture-state="gestureState"
      :is-swiping="isSwiping"
      :is-pinching="isPinching"
      :is-long-pressing="isLongPressing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface GestureState {
  startPoint: TouchPoint | null
  currentPoint: TouchPoint | null
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  velocity: number
  scale: number
  rotation: number
}

interface Props {
  // 滑动相关配置
  swipeThreshold?: number // 滑动阈值（像素）
  swipeVelocityThreshold?: number // 滑动速度阈值
  
  // 长按相关配置
  longPressDelay?: number // 长按延迟（毫秒）
  longPressMoveThreshold?: number // 长按移动阈值
  
  // 缩放相关配置
  pinchThreshold?: number // 缩放阈值
  
  // 禁用某些手势
  disableSwipe?: boolean
  disableLongPress?: boolean
  disablePinch?: boolean
  
  // 防止默认行为
  preventDefault?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  longPressDelay: 500,
  longPressMoveThreshold: 10,
  pinchThreshold: 0.1,
  disableSwipe: false,
  disableLongPress: false,
  disablePinch: false,
  preventDefault: true
})

const emit = defineEmits<{
  // 滑动事件
  swipeStart: [direction: string, distance: number]
  swipeMove: [direction: string, distance: number, velocity: number]
  swipeEnd: [direction: string, distance: number, velocity: number]
  swipe: [direction: string, distance: number, velocity: number]
  
  // 长按事件
  longPressStart: [x: number, y: number]
  longPressEnd: [x: number, y: number]
  longPress: [x: number, y: number, duration: number]
  
  // 缩放事件
  pinchStart: [scale: number]
  pinchMove: [scale: number, rotation: number]
  pinchEnd: [scale: number, rotation: number]
  
  // 点击事件
  tap: [x: number, y: number]
  doubleTap: [x: number, y: number]
  
  // 通用触摸事件
  touchStart: [touches: TouchList]
  touchMove: [touches: TouchList]
  touchEnd: [touches: TouchList]
}>()

const gestureContainer = ref<HTMLElement>()
const gestureState = reactive<GestureState>({
  startPoint: null,
  currentPoint: null,
  direction: null,
  distance: 0,
  velocity: 0,
  scale: 1,
  rotation: 0
})

// 状态变量
const isSwiping = ref(false)
const isPinching = ref(false)
const isLongPressing = ref(false)
const touches = ref<Touch[]>([])
const lastTouchTime = ref(0)
const tapCount = ref(0)
const longPressTimer = ref<NodeJS.Timeout | null>(null)
let initialDistance = 0
let initialAngle = 0

// 触摸开始
const handleTouchStart = (event: TouchEvent) => {
  if (props.preventDefault) {
    event.preventDefault()
  }

  touches.value = Array.from(event.touches)
  const touch = event.touches[0]
  const now = Date.now()

  gestureState.startPoint = {
    x: touch.clientX,
    y: touch.clientY,
    timestamp: now
  }

  gestureState.currentPoint = { ...gestureState.startPoint }

  // 单指操作
  if (event.touches.length === 1) {
    // 检测双击
    const timeSinceLastTap = now - lastTouchTime.value
    if (timeSinceLastTap < 300) {
      tapCount.value++
      if (tapCount.value === 2) {
        emit('doubleTap', touch.clientX, touch.clientY)
        tapCount.value = 0
      }
    } else {
      tapCount.value = 1
    }
    lastTouchTime.value = now

    // 开始长按检测
    if (!props.disableLongPress) {
      longPressTimer.value = setTimeout(() => {
        if (gestureState.startPoint) {
          isLongPressing.value = true
          emit('longPressStart', gestureState.startPoint.x, gestureState.startPoint.y)
        }
      }, props.longPressDelay)
    }
  }

  // 双指操作（缩放、旋转）
  if (event.touches.length === 2 && !props.disablePinch) {
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    
    initialDistance = getDistance(touch1, touch2)
    initialAngle = getAngle(touch1, touch2)
    gestureState.scale = 1
    gestureState.rotation = 0
    
    isPinching.value = true
    emit('pinchStart', 1)
  }

  emit('touchStart', event.touches)
}

// 触摸移动
const handleTouchMove = (event: TouchEvent) => {
  if (props.preventDefault) {
    event.preventDefault()
  }

  if (!gestureState.startPoint) return

  const touch = event.touches[0]
  const now = Date.now()

  gestureState.currentPoint = {
    x: touch.clientX,
    y: touch.clientY,
    timestamp: now
  }

  // 计算距离和方向
  const deltaX = gestureState.currentPoint.x - gestureState.startPoint.x
  const deltaY = gestureState.currentPoint.y - gestureState.startPoint.y
  gestureState.distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // 计算速度
  const deltaTime = now - gestureState.startPoint.timestamp
  gestureState.velocity = deltaTime > 0 ? gestureState.distance / deltaTime : 0

  // 确定方向
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    gestureState.direction = deltaX > 0 ? 'right' : 'left'
  } else {
    gestureState.direction = deltaY > 0 ? 'down' : 'up'
  }

  // 单指滑动
  if (event.touches.length === 1) {
    // 取消长按
    if (longPressTimer.value && gestureState.distance > props.longPressMoveThreshold) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }

    // 滑动检测
    if (!props.disableSwipe && gestureState.distance > props.swipeThreshold) {
      if (!isSwiping.value) {
        isSwiping.value = true
        emit('swipeStart', gestureState.direction!, gestureState.distance)
      } else {
        emit('swipeMove', gestureState.direction!, gestureState.distance, gestureState.velocity)
      }
    }
  }

  // 双指缩放和旋转
  if (event.touches.length === 2 && isPinching.value) {
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    
    const currentDistance = getDistance(touch1, touch2)
    const currentAngle = getAngle(touch1, touch2)
    
    gestureState.scale = currentDistance / initialDistance
    gestureState.rotation = currentAngle - initialAngle
    
    emit('pinchMove', gestureState.scale, gestureState.rotation)
  }

  emit('touchMove', event.touches)
}

// 触摸结束
const handleTouchEnd = (event: TouchEvent) => {
  if (props.preventDefault) {
    event.preventDefault()
  }

  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  // 长按结束
  if (isLongPressing.value) {
    isLongPressing.value = false
    if (gestureState.startPoint) {
      const duration = Date.now() - gestureState.startPoint.timestamp
      emit('longPressEnd', gestureState.startPoint.x, gestureState.startPoint.y)
      emit('longPress', gestureState.startPoint.x, gestureState.startPoint.y, duration)
    }
  }

  // 滑动结束
  if (isSwiping.value) {
    isSwiping.value = false
    emit('swipeEnd', gestureState.direction!, gestureState.distance, gestureState.velocity)
    emit('swipe', gestureState.direction!, gestureState.distance, gestureState.velocity)
  }

  // 缩放结束
  if (isPinching.value) {
    isPinching.value = false
    emit('pinchEnd', gestureState.scale, gestureState.rotation)
  }

  // 单击检测
  if (
    !isSwiping.value && 
    !isLongPressing.value && 
    !isPinching.value &&
    gestureState.distance < props.swipeThreshold &&
    tapCount.value === 1
  ) {
    setTimeout(() => {
      if (tapCount.value === 1 && gestureState.startPoint) {
        emit('tap', gestureState.startPoint.x, gestureState.startPoint.y)
        tapCount.value = 0
      }
    }, 300)
  }

  // 重置状态
  if (event.touches.length === 0) {
    resetGestureState()
  }

  emit('touchEnd', event.touches)
}

// 触摸取消
const handleTouchCancel = (event: TouchEvent) => {
  resetGestureState()
  
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 重置手势状态
const resetGestureState = () => {
  gestureState.startPoint = null
  gestureState.currentPoint = null
  gestureState.direction = null
  gestureState.distance = 0
  gestureState.velocity = 0
  gestureState.scale = 1
  gestureState.rotation = 0
  
  isSwiping.value = false
  isPinching.value = false
  isLongPressing.value = false
  touches.value = []
}

// 计算两点距离
const getDistance = (touch1: Touch, touch2: Touch): number => {
  const deltaX = touch1.clientX - touch2.clientX
  const deltaY = touch1.clientY - touch2.clientY
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

// 计算两点角度
const getAngle = (touch1: Touch, touch2: Touch): number => {
  const deltaX = touch1.clientX - touch2.clientX
  const deltaY = touch1.clientY - touch2.clientY
  return Math.atan2(deltaY, deltaX) * 180 / Math.PI
}

// 暴露方法
defineExpose({
  resetGestureState,
  gestureState,
  isSwiping: () => isSwiping.value,
  isPinching: () => isPinching.value,
  isLongPressing: () => isLongPressing.value
})

onMounted(() => {
  // 禁用移动端的一些默认行为
  if (gestureContainer.value) {
    gestureContainer.value.style.touchAction = 'manipulation'
  }
})

onUnmounted(() => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
})
</script>

<style scoped>
.touch-gesture-container {
  width: 100%;
  height: 100%;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

/* 禁用iOS的弹性滚动 */
.touch-gesture-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* 为手势交互提供视觉反馈 */
.touch-gesture-container.is-swiping {
  cursor: grabbing;
}

.touch-gesture-container.is-pinching {
  cursor: zoom-in;
}

.touch-gesture-container.is-long-pressing {
  user-select: text;
  -webkit-user-select: text;
}
</style>