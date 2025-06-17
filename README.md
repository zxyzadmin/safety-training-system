# 安全教育培训档案管理系统

专业的企业安全教育培训档案管理平台，提供全面的培训管理、档案归集、统计分析等核心功能。

## 🚀 系统特色

### 核心技术
- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia  
- **路由管理**: Vue Router 4
- **图表库**: ECharts + Vue-ECharts
- **样式方案**: CSS Variables + 响应式设计

### 主要功能
- 🔐 **用户认证系统** - 支持多角色权限管理
- 📚 **培训资料管理** - 上传、审批、下载、搜索
- 📁 **档案归集管理** - 完整的档案生命周期管理
- 📊 **统计分析** - 数据可视化和报表生成
- 🔔 **通知系统** - 实时消息推送和提醒
- 🎨 **主题切换** - 支持明暗主题自动切换
- 📱 **响应式设计** - 完美适配各种设备

### 系统优势
- 🎯 **专业UI设计** - 现代化企业级界面
- ⚡ **高性能** - 代码分割、懒加载、缓存优化
- 🔧 **工程化完善** - TypeScript、ESLint、自动化构建
- 🌐 **无障碍访问** - 符合无障碍访问标准
- 🔒 **安全可靠** - 多层安全防护机制

## 📦 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装部署

```bash
# 克隆项目
git clone https://github.com/username/safety-training-system.git
cd safety-training-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 在线访问
- **开发环境**: http://localhost:3000
- **生产环境**: https://your-domain.github.io/safety-training-system

## 🏗️ 项目架构

```
src/
├── components/          # 公共组件库
│   ├── Layout/         # 布局组件
│   ├── Icons/          # 图标组件  
│   ├── Charts/         # 图表组件
│   └── Forms/          # 表单组件
├── views/              # 页面组件
│   ├── Login.vue       # 登录页面
│   ├── Dashboard.vue   # 工作台
│   ├── Training/       # 培训管理
│   ├── Archive/        # 档案管理
│   ├── Standards/      # 标准规范
│   ├── Statistics/     # 统计分析
│   └── Personal/       # 个人工作台
├── store/              # 状态管理
│   ├── modules/        # 业务模块
│   └── types/          # 状态类型
├── services/           # 数据服务
├── utils/              # 工具函数
├── router/             # 路由配置
├── types/              # TypeScript 类型
└── styles/             # 样式文件
```

## 🎨 设计规范

### 颜色体系
- **主色调**: #1e88e5 (专业蓝)
- **辅助色**: #ff9800 (警示橙)  
- **成功色**: #4caf50 (安全绿)
- **警告色**: #ff9800 (注意橙)
- **危险色**: #f44336 (危险红)

### 组件规范
- 基于 8px 网格系统设计
- 遵循 Material Design 3 规范
- 支持深色/浅色主题切换
- 完全响应式布局

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 最佳实践
- 组件采用 `<script setup>` 语法
- 样式使用 CSS Variables 和 scoped 模式

### 组件开发模板
```vue
<template>
  <div class="component-container">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  title: string
  data?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
})

const emit = defineEmits<{
  change: [value: any]
  submit: [data: any]
}>()

// 响应式数据
const loading = ref(false)
const formData = ref({})

// 计算属性
const isValid = computed(() => {
  // 验证逻辑
})

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
.component-container {
  /* 样式定义 */
}
</style>
```

## 📊 功能模块

### 培训管理
- 培训资料CRUD操作
- 文件上传下载
- 培训进度跟踪
- 培训效果评估

### 档案管理
- 档案分类管理
- 高级搜索功能
- 审批流程管理
- 批量操作支持

### 统计分析
- 实时数据大屏
- 多维度统计图表
- 培训效果分析
- 报表导出功能

### 系统管理
- 用户权限管理
- 系统参数配置
- 操作日志记录
- 数据备份恢复

## 🔐 安全特性

- **身份认证**: 支持多种认证方式
- **权限控制**: 基于角色的访问控制(RBAC)
- **数据安全**: 敏感数据加密存储
- **输入验证**: 全面的数据验证机制
- **安全审计**: 完整的操作日志记录

## 🌍 浏览器兼容性

| 浏览器 | 版本要求 |
|--------|----------|
| Chrome | >= 90 |
| Firefox | >= 88 |
| Safari | >= 14 |
| Edge | >= 90 |

## 📝 版本历史

### v2.0.0 (2024-01-20)
- 🎉 全新的现代化Web应用架构
- ✨ 采用Vue 3 + TypeScript技术栈
- 🎨 全新的企业级UI设计
- 📱 完美的移动端适配
- ⚡ 大幅提升的系统性能
- 🔧 完善的开发工具链

### v1.0.0 (2023-12-01)
- 🚀 系统首次发布
- 📚 基础培训管理功能
- 📁 档案管理核心功能
- 📊 基础统计分析功能

## 🤝 参与贡献

欢迎提交Issue和Pull Request来帮助改进项目！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/NewFeature`)
3. 提交更改 (`git commit -m 'Add NewFeature'`)
4. 推送到分支 (`git push origin feature/NewFeature`)
5. 创建Pull Request

## 📞 技术支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

- 📧 邮箱: support@safety-training.com
- 📱 技术支持: 400-xxx-xxxx
- 💬 在线客服: 系统内置客服功能
- 📖 帮助文档: [使用手册](./docs/user-guide.md)

## 📄 开源协议

本项目基于 MIT 协议开源，详情请查看 [LICENSE](LICENSE) 文件。

## 👨‍💻 开发团队

- **项目作者**: 郭学凡
- **技术架构**: Vue 3 + TypeScript + Vite
- **UI设计**: Modern Enterprise Design System

---

> 💡 **系统说明**: 本系统专为企业安全教育培训管理而设计，提供完整的培训流程管理和数据分析功能，帮助企业建立规范化的安全培训体系。