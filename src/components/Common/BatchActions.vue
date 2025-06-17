<template>
  <div v-if="selectedCount > 0" class="batch-actions-bar">
    <div class="batch-info">
      <el-checkbox 
        v-model="selectAll" 
        :indeterminate="isIndeterminate"
        @change="handleSelectAllChange"
      />
      <span class="selected-count">
        已选择 {{ selectedCount }} 项
        <span v-if="totalCount" class="total-count">/ 共 {{ totalCount }} 项</span>
      </span>
    </div>

    <div class="batch-actions">
      <!-- 预定义操作按钮 -->
      <el-button
        v-if="showDelete"
        type="danger"
        size="small"
        :disabled="!canDelete"
        @click="handleDelete"
      >
        <el-icon><Delete /></el-icon>
        删除 ({{ selectedCount }})
      </el-button>

      <el-button
        v-if="showExport"
        type="primary"
        size="small"
        :disabled="!canExport"
        @click="handleExport"
      >
        <el-icon><Download /></el-icon>
        导出 ({{ selectedCount }})
      </el-button>

      <el-button
        v-if="showMove"
        size="small"
        :disabled="!canMove"
        @click="handleMove"
      >
        <el-icon><FolderOpened /></el-icon>
        移动
      </el-button>

      <el-button
        v-if="showCopy"
        size="small"
        :disabled="!canCopy"
        @click="handleCopy"
      >
        <el-icon><CopyDocument /></el-icon>
        复制
      </el-button>

      <!-- 状态操作 -->
      <el-dropdown v-if="statusActions.length > 0" @command="handleStatusChange">
        <el-button size="small">
          状态操作
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="action in statusActions"
              :key="action.value"
              :command="action.value"
              :disabled="action.disabled"
            >
              <el-icon v-if="action.icon"><component :is="action.icon" /></el-icon>
              {{ action.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 自定义操作 -->
      <slot name="actions" :selected-count="selectedCount" :selected-items="selectedItems" />

      <!-- 更多操作 -->
      <el-dropdown v-if="moreActions.length > 0" @command="handleMoreAction">
        <el-button size="small">
          更多
          <el-icon class="el-icon--right"><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="action in moreActions"
              :key="action.key"
              :command="action.key"
              :disabled="action.disabled"
              :divided="action.divided"
            >
              <el-icon v-if="action.icon"><component :is="action.icon" /></el-icon>
              {{ action.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="batch-close">
      <el-button size="small" text @click="handleClearSelection">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Delete, 
  Download, 
  FolderOpened, 
  CopyDocument, 
  ArrowDown,
  More,
  Close
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

interface StatusAction {
  label: string
  value: string
  icon?: any
  disabled?: boolean
}

interface MoreAction {
  key: string
  label: string
  icon?: any
  disabled?: boolean
  divided?: boolean
  handler: (selectedItems: any[]) => void
}

interface Props {
  selectedItems: any[]
  totalCount?: number
  showDelete?: boolean
  showExport?: boolean
  showMove?: boolean
  showCopy?: boolean
  canDelete?: boolean
  canExport?: boolean
  canMove?: boolean
  canCopy?: boolean
  statusActions?: StatusAction[]
  moreActions?: MoreAction[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedItems: () => [],
  totalCount: 0,
  showDelete: true,
  showExport: true,
  showMove: false,
  showCopy: false,
  canDelete: true,
  canExport: true,
  canMove: true,
  canCopy: true,
  statusActions: () => [],
  moreActions: () => []
})

const emit = defineEmits<{
  'select-all': [checked: boolean]
  'clear-selection': []
  'delete': [items: any[]]
  'export': [items: any[]]
  'move': [items: any[]]
  'copy': [items: any[]]
  'status-change': [status: string, items: any[]]
  'action': [action: string, items: any[]]
}>()

const selectedCount = computed(() => props.selectedItems.length)

const selectAll = computed({
  get: () => props.totalCount > 0 && selectedCount.value === props.totalCount,
  set: (value: boolean) => emit('select-all', value)
})

const isIndeterminate = computed(() => 
  selectedCount.value > 0 && selectedCount.value < (props.totalCount || 0)
)

// 事件处理
const handleSelectAllChange = (checked: boolean) => {
  emit('select-all', checked)
}

const handleClearSelection = () => {
  emit('clear-selection')
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这 ${selectedCount.value} 个项目吗？此操作不可撤销。`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emit('delete', props.selectedItems)
  } catch {
    // 用户取消删除
  }
}

const handleExport = () => {
  emit('export', props.selectedItems)
  ElMessage.success(`正在导出 ${selectedCount.value} 个项目...`)
}

const handleMove = () => {
  emit('move', props.selectedItems)
}

const handleCopy = () => {
  emit('copy', props.selectedItems)
}

const handleStatusChange = (status: string) => {
  emit('status-change', status, props.selectedItems)
}

const handleMoreAction = (actionKey: string) => {
  const action = props.moreActions.find(a => a.key === actionKey)
  if (action && action.handler) {
    action.handler(props.selectedItems)
  }
  emit('action', actionKey, props.selectedItems)
}
</script>

<style scoped>
.batch-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-lighter);
  border: 1px solid var(--primary-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  animation: slideUp var(--transition-normal) var(--ease-out-quart);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.selected-count {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.total-count {
  color: var(--text-secondary);
  font-weight: var(--font-normal);
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: center;
}

.batch-close {
  display: flex;
  align-items: center;
}

/* 按钮样式增强 */
.batch-actions .el-button {
  transition: all var(--transition-fast);
}

.batch-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.batch-actions .el-button[type="danger"]:hover {
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-actions-bar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .batch-info {
    justify-content: center;
  }

  .batch-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .batch-close {
    justify-content: center;
  }
}

/* 深色模式适配 */
html.dark .batch-actions-bar {
  background: rgba(64, 158, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.3);
}
</style>