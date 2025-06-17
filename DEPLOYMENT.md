# 部署指南

## GitHub Pages 部署步骤

### 1. 准备GitHub仓库
确保你有权限访问目标仓库: `https://github.com/zxyzadmin/safety-training-system.git`

### 2. 推送代码到GitHub
```bash
# 如果还没有推送过，执行以下命令:
git push origin main
```

### 3. 启用GitHub Pages
1. 进入GitHub仓库设置页面
2. 找到 "Pages" 设置选项
3. 选择部署源为 "GitHub Actions"
4. 系统将自动使用 `.github/workflows/deploy.yml` 进行部署

### 4. 访问部署的网站
部署完成后，可以通过以下地址访问：
- **主应用**: https://zxyzadmin.github.io/safety-training-system/
- **独立版本**: https://zxyzadmin.github.io/safety-training-system/standalone.html

## 本地测试构建

### 构建项目
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 部署配置说明

### Vite配置
- `base: '/safety-training-system/'` - 设置GitHub Pages的基础路径
- 配置了代码分割优化
- 支持多入口构建（主应用 + 独立HTML版本）

### GitHub Actions工作流
- 自动在push到main分支时触发部署
- 使用Node.js 18环境
- 自动安装依赖、构建项目、部署到GitHub Pages

### 文件结构
```
dist/
├── index.html              # 主应用入口
├── standalone.html         # 独立版本
├── assets/                 # 静态资源
│   ├── js/                # JavaScript文件
│   ├── css/               # 样式文件
│   └── images/            # 图片文件
└── favicon.svg            # 网站图标
```

## 故障排除

### 常见问题

1. **权限问题**
   - 确保你有仓库的push权限
   - 检查GitHub个人访问令牌设置

2. **构建失败**
   - 检查Node.js版本（需要>=16）
   - 确认所有依赖已正确安装

3. **页面无法访问**
   - 检查GitHub Pages设置是否正确
   - 确认部署工作流是否成功执行

### 手动部署
如果自动部署失败，可以手动构建并部署：

```bash
# 1. 构建项目
npm run build

# 2. 进入构建目录
cd dist

# 3. 初始化git并推送到gh-pages分支
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/zxyzadmin/safety-training-system.git
git push -f origin gh-pages
```

## 项目特性

### 技术栈
- **前端**: Vue 3 + TypeScript + Vite
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图表**: ECharts

### 主要功能
- 用户认证和权限管理
- 培训资料管理（CRUD、上传下载、审批）
- 档案归集管理（分类、搜索、批量操作）
- 响应式设计和主题切换
- 独立HTML版本（无需构建环境）

### 性能优化
- 代码分割和懒加载
- 资源压缩和缓存
- 组件级别的样式隔离
- TypeScript类型安全

---

**开发者**: 郭学凡  
**版本**: v2.0.0  
**最后更新**: 2024年1月