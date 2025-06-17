<template>
  <div 
    ref="listContainer" 
    class="virtual-list"
    :style="{ height: containerHeight }"
    @scroll="handleScroll"
  >
    <!-- 虚拟滚动区域 -->
    <div 
      class="virtual-scroll-area"
      :style="{ height: totalHeight + 'px' }"
    >
      <!-- 可见项容器 -->
      <div 
        class="visible-items"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          class="virtual-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot 
            :item="item" 
            :index="startIndex + index"
            :loading="isLoading"
          >
            <!-- 默认渲染 -->
            <div class="default-item">
              {{ JSON.stringify(item) }}
            </div>
          </slot>
        </div>

        <!-- 加载更多指示器 -->
        <div 
          v-if="showLoadMore && hasMore" 
          class="load-more-indicator"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot name="loadMore">
            <div class="default-load-more">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="items.length === 0 && !isLoading" class="empty-state">
      <slot name="empty">
        <el-empty description="暂无数据" />
      </slot>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading && items.length === 0" class="loading-state">
      <slot name="loading">
        <div class="default-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight?: string
  overscan?: number // 预渲染项目数量
  keyField?: string
  isLoading?: boolean
  hasMore?: boolean
  loadMoreThreshold?: number // 触发加载更多的阈值（距离底部的像素）
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  itemHeight: 50,
  containerHeight: '400px',
  overscan: 5,
  keyField: 'id',
  isLoading: false,
  hasMore: false,
  loadMoreThreshold: 100
})

const emit = defineEmits<{
  loadMore: []
  scroll: [scrollTop: number]
}>()

const listContainer = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeightPx = ref(400)

// 计算总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

// 计算可见区域能显示的项目数量
const visibleCount = computed(() => {
  return Math.ceil(containerHeightPx.value / props.itemHeight) + props.overscan * 2
})

// 计算开始索引
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.overscan
  return Math.max(0, index)
})

// 计算结束索引
const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value
  return Math.min(props.items.length, index)
})

// 计算可见项目
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

// 计算偏移量
const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

// 是否显示加载更多
const showLoadMore = computed(() => {
  if (!props.hasMore || props.isLoading) return false
  
  const distanceToBottom = totalHeight.value - scrollTop.value - containerHeightPx.value
  return distanceToBottom <= props.loadMoreThreshold
})

// 获取项目唯一标识
const getItemKey = (item: any, index: number): string | number => {
  if (props.keyField && item[props.keyField] !== undefined) {
    return item[props.keyField]
  }
  return index
}

// 处理滚动事件
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  
  emit('scroll', scrollTop.value)
  
  // 检查是否需要加载更多
  if (showLoadMore.value && props.hasMore && !props.isLoading) {
    emit('loadMore')
  }
}

// 滚动到指定位置
const scrollTo = (index: number) => {
  if (!listContainer.value) return
  
  const scrollPosition = index * props.itemHeight
  listContainer.value.scrollTop = scrollPosition
}

// 滚动到顶部
const scrollToTop = () => {
  scrollTo(0)
}

// 滚动到底部
const scrollToBottom = () => {
  scrollTo(props.items.length - 1)
}

// 获取容器高度
const updateContainerHeight = () => {
  if (!listContainer.value) return
  
  const height = props.containerHeight
  if (height.includes('px')) {
    containerHeightPx.value = parseInt(height)
  } else if (height.includes('%')) {
    const parentHeight = listContainer.value.parentElement?.clientHeight || 400
    const percentage = parseInt(height) / 100
    containerHeightPx.value = parentHeight * percentage
  } else {
    containerHeightPx.value = parseInt(height) || 400
  }
}

// 响应式处理
const resizeObserver = ref<ResizeObserver>()

onMounted(() => {
  updateContainerHeight()
  
  // 监听容器大小变化
  if (listContainer.value && 'ResizeObserver' in window) {
    resizeObserver.value = new ResizeObserver(() => {
      updateContainerHeight()
    })
    resizeObserver.value.observe(listContainer.value)
  }
})

onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// 监听容器高度变化
watch(() => props.containerHeight, () => {
  updateContainerHeight()
})

// 监听数据变化，重置滚动位置
watch(() => props.items.length, (newLength, oldLength) => {
  // 如果是新数据（数量从0变化），滚动到顶部
  if (oldLength === 0 && newLength > 0) {
    nextTick(() => {
      scrollToTop()
    })
  }
})

// 暴露方法
defineExpose({
  scrollTo,
  scrollToTop,
  scrollToBottom,
  getScrollTop: () => scrollTop.value
})
</script>

<style scoped>
.virtual-list {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

.virtual-scroll-area {
  position: relative;
  width: 100%;
}

.visible-items {
  position: relative;
  width: 100%;
}

.virtual-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-fast);
}

.virtual-item:hover {
  background-color: var(--hover-overlay);
}

.virtual-item:last-child {
  border-bottom: none;
}

.default-item {
  flex: 1;
  padding: var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--font-sm);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.load-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-bottom: 1px solid var(--border-light);
}

.default-load-more {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.default-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

/* 自定义滚动条 */
.virtual-list::-webkit-scrollbar {
  width: 6px;
}

.virtual-list::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.virtual-list::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-normal);
}

.virtual-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .virtual-item {
    padding: 0 var(--spacing-sm);
  }
  
  .default-item {
    font-size: var(--font-xs);
  }
}
</style>