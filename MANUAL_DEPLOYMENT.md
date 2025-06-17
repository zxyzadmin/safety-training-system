# 手动部署指南

## 当前状态

项目已完全准备就绪，包含：
- ✅ 完整的Vue 3 + TypeScript应用
- ✅ 所有功能模块已开发完成
- ✅ GitHub Actions自动部署配置
- ✅ 构建成功测试通过
- ✅ 作者信息已更正为"郭学凡"

## 需要手动完成的步骤

### 1. 检查GitHub令牌权限

当前提供的令牌可能权限不足。请确保令牌包含以下权限：
- ✅ `repo` (完整仓库访问权限)
- ✅ `workflow` (GitHub Actions权限)
- ✅ `contents:write` (文件写入权限)

### 2. 手动上传文件

有几种方式可以完成上传：

#### 方式A：通过GitHub网页界面
1. 访问 https://github.com/zxyzadmin/safety-training-system
2. 删除仓库中现有文件（如果有）
3. 上传项目压缩包：`/home/boning/safety-training-system.tar.gz`
4. 解压并提交

#### 方式B：克隆并手动复制
```bash
# 在另一台有权限的机器上执行
git clone https://github.com/zxyzadmin/safety-training-system.git
cd safety-training-system
# 复制所有项目文件到这个目录
git add .
git commit -m "feat: 安全教育培训档案管理系统v2.0"
git push origin main
```

#### 方式C：重新生成令牌
1. 在GitHub设置中删除当前令牌
2. 生成新的令牌，确保包含所有必要权限
3. 重新尝试推送

### 3. 启用GitHub Pages

项目推送成功后：
1. 进入仓库设置页面
2. 找到 "Pages" 选项
3. 选择部署源为 "GitHub Actions"
4. 系统会自动运行 `.github/workflows/deploy.yml`

### 4. 访问部署的网站

部署完成后可通过以下地址访问：
- **主应用**: https://zxyzadmin.github.io/safety-training-system/
- **独立版本**: https://zxyzadmin.github.io/safety-training-system/standalone.html

## 项目文件清单

当前项目包含以下重要文件：

### 配置文件
- `package.json` - 项目配置和依赖
- `vite.config.ts` - Vite构建配置
- `tsconfig.json` - TypeScript配置
- `.gitignore` - Git忽略文件配置

### 源代码
- `src/` - 源代码目录
  - `views/` - 页面组件
  - `components/` - 公共组件
  - `store/` - 状态管理
  - `router/` - 路由配置
  - `types/` - TypeScript类型定义

### 部署相关
- `.github/workflows/deploy.yml` - GitHub Actions部署配置
- `index.html` - 主应用入口
- `standalone.html` - 独立版本
- `DEPLOYMENT.md` - 部署说明
- `README.md` - 项目文档

### 构建产物
- `dist/` - 构建后的静态文件（已测试构建成功）

## 预期效果

部署成功后，用户可以：
1. 访问现代化的Vue 3应用
2. 使用完整的培训管理功能
3. 管理档案归集和搜索
4. 享受响应式设计和主题切换
5. 使用独立HTML版本（无需构建环境）

## 技术特色

- Vue 3 + Composition API
- TypeScript严格模式  
- Element Plus UI组件库
- Pinia状态管理
- 响应式设计
- 深色/浅色主题
- 代码分割优化
- GitHub Actions自动部署

---

**开发完成**: 郭学凡  
**项目版本**: v2.0.0  
**部署目标**: https://github.com/zxyzadmin/safety-training-system