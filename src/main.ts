import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 全局样式
import './styles/variables.css'
import './styles/animations.css'
import './styles/main.css'
import './styles/mobile.css'

// Element Plus 样式
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化认证状态
import { useAuthStore } from './store/auth'
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')