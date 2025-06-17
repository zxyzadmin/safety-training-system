<template>
  <div class="standards-list">
    <el-result icon="info" title="标准规范" sub-title="该页面正在开发中">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
// 页面开发中
</script>

<style scoped>
.standards-list {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>