<template>
  <div class="personal-workspace">
    <el-result icon="info" title="个人工作台" sub-title="该页面正在开发中">
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
.personal-workspace {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>