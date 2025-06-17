export interface User {
  id: number
  username: string
  password: string
  name: string
  role: 'admin' | 'user'
  department: string
  email: string
  phone: string
  avatar: string
  createdAt: string
  lastLoginAt: string | null
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface UserProfile {
  name: string
  email: string
  phone: string
  department: string
  avatar?: string
}