<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-pattern"></div>
    </div>
    
    <div class="login-content">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <img src="/favicon.svg" alt="系统标识" class="logo">
            <h1 class="system-title">安全教育培训档案管理系统</h1>
            <p class="system-subtitle">Safety Training & Archive Management System</p>
          </div>
        </div>

        <div class="login-form-wrapper">
          <h2 class="form-title">用户登录</h2>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            @keyup.enter="handleLogin"
            class="login-form"
            size="large"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.rememberMe">
                  记住我
                </el-checkbox>
                <a href="#" class="forgot-password">忘记密码？</a>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="authStore.isLoading"
                @click="handleLogin"
                class="login-button"
                size="large"
              >
                {{ authStore.isLoading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>

          <div class="demo-accounts">
            <h4>演示账号</h4>
            <div class="demo-list">
              <div class="demo-item" @click="quickLogin('admin', 'admin123')">
                <el-tag type="danger">管理员</el-tag>
                <span>admin / admin123</span>
              </div>
              <div class="demo-item" @click="quickLogin('user', 'user123')">
                <el-tag type="info">普通用户</el-tag>
                <span>user / user123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题切换按钮 -->
    <div class="theme-toggle">
      <el-button
        :icon="isDark ? Sunny : Moon"
        circle
        @click="themeStore.toggleTheme()"
        class="theme-btn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Sunny, Moon } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginCredentials } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const loginFormRef = ref<FormInstance>()

const loginForm = reactive<LoginCredentials>({
  username: '',
  password: '',
  rememberMe: false
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    const success = await authStore.login(loginForm)
    if (success) {
      router.push('/')
    }
  } catch (error) {
    console.error('登录验证失败:', error)
  }
}

const quickLogin = (username: string, password: string) => {
  loginForm.username = username
  loginForm.password = password
  handleLogin()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.login-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1000px;
  padding: 20px;
}

.login-card {
  background: var(--bg-primary);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
  backdrop-filter: blur(10px);
}

.login-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.logo-section {
  max-width: 300px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  filter: brightness(0) invert(1);
}

.system-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.2;
}

.system-subtitle {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 400;
}

.login-form-wrapper {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 30px;
  text-align: center;
}

.login-form {
  margin-bottom: 30px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  color: var(--primary-color);
  font-size: 14px;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.forgot-password:hover {
  color: var(--primary-dark);
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.demo-accounts {
  border-top: 1px solid var(--border-light);
  padding-top: 20px;
}

.demo-accounts h4 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-align: center;
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: 13px;
}

.demo-item:hover {
  background-color: var(--bg-secondary);
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  backdrop-filter: blur(10px);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .login-header {
    padding: 40px 30px;
  }
  
  .system-title {
    font-size: 24px;
  }
  
  .login-form-wrapper {
    padding: 40px 30px;
  }
}

/* 深色主题适配 */
.dark .login-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
}

.dark .bg-pattern {
  opacity: 0.3;
}
</style>