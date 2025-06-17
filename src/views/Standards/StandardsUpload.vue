<template>
  <div class="standards-upload">
    <el-result icon="info" title="上传标准文件" sub-title="该页面正在开发中">
      <template #extra>
        <el-button type="primary" @click="$router.go(-1)">返回上一页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
// 页面开发中
</script>

<style scoped>
.standards-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>