import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || 'user')
  const isAdmin = computed(() => userRole.value === 'admin')

  // 初始化用户数据
  const initializeUsers = () => {
    const users = localStorage.getItem('safety_users')
    if (!users) {
      const defaultUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          name: '系统管理员',
          role: 'admin',
          department: '安全科',
          email: 'admin@safety.com',
          phone: '138****1234',
          avatar: '',
          createdAt: new Date().toISOString(),
          lastLoginAt: null
        },
        {
          id: 2,
          username: 'user',
          password: 'user123',
          name: '普通用户',
          role: 'user',
          department: '生产部',
          email: 'user@safety.com',
          phone: '139****5678',
          avatar: '',
          createdAt: new Date().toISOString(),
          lastLoginAt: null
        }
      ]
      localStorage.setItem('safety_users', JSON.stringify(defaultUsers))
    }
  }

  // 获取所有用户
  const getUsers = (): User[] => {
    const users = localStorage.getItem('safety_users')
    return users ? JSON.parse(users) : []
  }

  // 保存用户到本地存储
  const saveUsers = (users: User[]) => {
    localStorage.setItem('safety_users', JSON.stringify(users))
  }

  // 登录
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = getUsers()
      const user = users.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      )

      if (user) {
        // 更新最后登录时间
        user.lastLoginAt = new Date().toISOString()
        const updatedUsers = users.map(u => u.id === user.id ? user : u)
        saveUsers(updatedUsers)
        
        // 设置当前用户
        currentUser.value = { ...user }
        
        // 保存到 sessionStorage
        sessionStorage.setItem('safety_current_user', JSON.stringify(user))
        
        ElMessage.success(`欢迎回来，${user.name}！`)
        return true
      } else {
        ElMessage.error('用户名或密码错误')
        return false
      }
    } catch (error) {
      ElMessage.error('登录失败，请稍后重试')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    currentUser.value = null
    sessionStorage.removeItem('safety_current_user')
    ElMessage.success('已安全退出')
  }

  // 初始化认证状态
  const initAuth = () => {
    const savedUser = sessionStorage.getItem('safety_current_user')
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        sessionStorage.removeItem('safety_current_user')
      }
    }
  }

  // 更新用户信息
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!currentUser.value) return false

    try {
      const users = getUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.value!.id)
      
      if (userIndex === -1) return false

      // 更新用户信息
      const updatedUser = { ...users[userIndex], ...data }
      users[userIndex] = updatedUser
      saveUsers(users)

      // 更新当前用户状态
      currentUser.value = updatedUser
      sessionStorage.setItem('safety_current_user', JSON.stringify(updatedUser))

      ElMessage.success('个人信息更新成功')
      return true
    } catch (error) {
      ElMessage.error('更新失败，请稍后重试')
      return false
    }
  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser.value) return false

    if (currentUser.value.password !== oldPassword) {
      ElMessage.error('原密码错误')
      return false
    }

    try {
      const users = getUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.value!.id)
      
      if (userIndex === -1) return false

      users[userIndex].password = newPassword
      saveUsers(users)

      currentUser.value.password = newPassword
      sessionStorage.setItem('safety_current_user', JSON.stringify(currentUser.value))

      ElMessage.success('密码修改成功')
      return true
    } catch (error) {
      ElMessage.error('密码修改失败')
      return false
    }
  }

  // 检查用户名是否存在
  const checkUsername = (username: string): boolean => {
    const users = getUsers()
    return users.some(u => u.username === username)
  }

  // 初始化
  initializeUsers()

  return {
    // 状态
    currentUser: readonly(currentUser),
    isLoading: readonly(isLoading),
    
    // 计算属性
    isAuthenticated,
    userRole,
    isAdmin,
    
    // 方法
    login,
    logout,
    initAuth,
    updateProfile,
    changePassword,
    checkUsername,
    getUsers
  }
})