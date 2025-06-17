<template>
  <el-tooltip
    :content="content"
    :placement="placement"
    :disabled="disabled"
    class="smart-tooltip"
  >
    <slot />
  </el-tooltip>
</template>

<script setup lang="ts">
interface Props {
  content?: string
  placement?: string
  disabled?: boolean
  shortcut?: string
  help?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  placement: 'top',
  disabled: false
})
</script>

<style scoped>
.smart-tooltip {
  display: inline-block;
}
</style>