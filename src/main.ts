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

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/safety-training-system/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 有新版本可用
                if (confirm('发现新版本，是否立即更新？')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                  window.location.reload()
                }
              }
            })
          }
        })
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// PWA 安装提示
let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止默认的安装提示
  e.preventDefault()
  deferredPrompt = e
  
  // 显示自定义安装按钮
  const installBtn = document.createElement('button')
  installBtn.textContent = '📱 安装应用'
  installBtn.className = 'pwa-install-btn'
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    background: linear-gradient(135deg, #1e88e5, #1565c0);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  `
  
  installBtn.addEventListener('mouseenter', () => {
    installBtn.style.transform = 'translateY(-2px)'
    installBtn.style.boxShadow = '0 6px 20px rgba(30, 136, 229, 0.4)'
  })
  
  installBtn.addEventListener('mouseleave', () => {
    installBtn.style.transform = 'translateY(0)'
    installBtn.style.boxShadow = '0 4px 12px rgba(30, 136, 229, 0.3)'
  })
  
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('用户同意安装PWA')
      } else {
        console.log('用户拒绝安装PWA')
      }
      
      deferredPrompt = null
      installBtn.remove()
    }
  })
  
  document.body.appendChild(installBtn)
})

// 安装成功后隐藏安装按钮
window.addEventListener('appinstalled', () => {
  console.log('PWA安装成功')
  const installBtn = document.querySelector('.pwa-install-btn')
  if (installBtn) {
    installBtn.remove()
  }
})

app.mount('#app')