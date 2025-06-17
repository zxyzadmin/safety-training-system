<template>
  <div
    ref="dragContainer"
    :class="containerClasses"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- 拖拽提示层 -->
    <div v-if="isDragging" class="drag-overlay">
      <div class="drag-hint">
        <el-icon class="drag-icon"><UploadFilled /></el-icon>
        <div class="drag-text">
          <div class="drag-title">{{ dragTitle }}</div>
          <div class="drag-subtitle">{{ dragSubtitle }}</div>
        </div>
      </div>
    </div>

    <!-- 默认内容 -->
    <slot :is-dragging="isDragging" :drag-count="dragCount">
      <div v-if="!isDragging" class="default-drop-zone">
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">
          <div>点击选择文件或拖拽文件到此处</div>
          <div class="upload-hint">{{ acceptText }}</div>
        </div>
      </div>
    </slot>

    <!-- 隐藏的文件输入 -->
    <input
      v-if="enableFileSelect"
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      @change="handleFileSelect"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

interface Props {
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  maxFiles?: number
  enableFileSelect?: boolean
  dragTitle?: string
  dragSubtitle?: string
  disabled?: boolean
}

interface DragEvent extends Event {
  dataTransfer: DataTransfer | null
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*/*',
  multiple: true,
  maxSize: 50,
  maxFiles: 10,
  enableFileSelect: true,
  dragTitle: '拖拽文件到此处',
  dragSubtitle: '支持多文件上传',
  disabled: false
})

const emit = defineEmits<{
  filesDropped: [files: File[]]
  filesSelected: [files: File[]]
  dragEnter: []
  dragLeave: []
  error: [message: string]
}>()

const dragContainer = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const dragCount = ref(0)

const containerClasses = computed(() => ({
  'drag-drop-container': true,
  'is-dragging': isDragging.value,
  'is-disabled': props.disabled
}))

const acceptText = computed(() => {
  if (props.accept === '*/*') return '支持所有文件类型'
  return `支持: ${props.accept}`
})

// 验证文件
const validateFiles = (files: File[]): File[] => {
  const validFiles: File[] = []
  
  for (const file of files) {
    // 检查文件大小
    if (file.size > props.maxSize * 1024 * 1024) {
      emit('error', `文件 "${file.name}" 超过大小限制 ${props.maxSize}MB`)
      continue
    }
    
    // 检查文件类型
    if (props.accept !== '*/*') {
      const acceptTypes = props.accept.split(',').map(type => type.trim())
      const isValidType = acceptTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        } else if (type.includes('/*')) {
          const mainType = type.split('/')[0]
          return file.type.startsWith(mainType)
        } else {
          return file.type === type
        }
      })
      
      if (!isValidType) {
        emit('error', `文件 "${file.name}" 类型不支持`)
        continue
      }
    }
    
    validFiles.push(file)
  }
  
  // 检查文件数量
  if (validFiles.length > props.maxFiles) {
    emit('error', `最多只能选择 ${props.maxFiles} 个文件`)
    return validFiles.slice(0, props.maxFiles)
  }
  
  return validFiles
}

// 拖拽事件处理
const handleDragEnter = (event: DragEvent) => {
  if (props.disabled) return
  
  dragCount.value++
  if (dragCount.value === 1) {
    isDragging.value = true
    emit('dragEnter')
  }
}

const handleDragLeave = (event: DragEvent) => {
  if (props.disabled) return
  
  dragCount.value--
  if (dragCount.value === 0) {
    isDragging.value = false
    emit('dragLeave')
  }
}

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return
  // 必须阻止默认行为以允许拖放
}

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return
  
  dragCount.value = 0
  isDragging.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length === 0) return
  
  const validFiles = validateFiles(files)
  if (validFiles.length > 0) {
    emit('filesDropped', validFiles)
  }
}

// 文件选择处理
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length === 0) return
  
  const validFiles = validateFiles(files)
  if (validFiles.length > 0) {
    emit('filesSelected', validFiles)
  }
  
  // 清空输入以允许重复选择同一文件
  target.value = ''
}

// 点击触发文件选择
const triggerFileSelect = () => {
  if (props.disabled || !props.enableFileSelect) return
  fileInput.value?.click()
}

// 全局拖拽事件监听（防止默认行为）
const handleGlobalDragOver = (event: Event) => {
  event.preventDefault()
}

const handleGlobalDrop = (event: Event) => {
  event.preventDefault()
}

onMounted(() => {
  // 阻止页面默认的拖拽行为
  document.addEventListener('dragover', handleGlobalDragOver)
  document.addEventListener('drop', handleGlobalDrop)
  
  // 点击容器触发文件选择
  if (props.enableFileSelect) {
    dragContainer.value?.addEventListener('click', triggerFileSelect)
  }
})

onUnmounted(() => {
  document.removeEventListener('dragover', handleGlobalDragOver)
  document.removeEventListener('drop', handleGlobalDrop)
})

// 暴露方法
defineExpose({
  triggerFileSelect
})
</script>

<style scoped>
.drag-drop-container {
  position: relative;
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  background-color: var(--bg-tertiary);
  transition: all var(--transition-fast);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.drag-drop-container:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-lighter);
}

.drag-drop-container.is-dragging {
  border-color: var(--primary-color);
  background-color: var(--primary-lighter);
  border-style: solid;
  animation: pulse 2s infinite;
}

.drag-drop-container.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(64, 158, 255, 0.1);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.drag-hint {
  text-align: center;
  color: var(--primary-color);
}

.drag-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  animation: bounceIn 0.6s var(--ease-bounce);
}

.drag-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-xs);
}

.drag-subtitle {
  font-size: var(--font-sm);
  opacity: 0.8;
}

.default-drop-zone {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-xl);
}

.upload-icon {
  font-size: 36px;
  margin-bottom: var(--spacing-md);
  color: var(--text-disabled);
}

.upload-text {
  font-size: var(--font-md);
}

.upload-hint {
  font-size: var(--font-sm);
  color: var(--text-disabled);
  margin-top: var(--spacing-sm);
}

/* 动画效果 */
.drag-drop-container.is-dragging .upload-icon {
  animation: pulse 1s infinite;
}

/* 深色模式适配 */
html.dark .drag-overlay {
  background: rgba(64, 158, 255, 0.15);
}
</style>