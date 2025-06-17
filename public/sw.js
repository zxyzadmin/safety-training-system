const CACHE_NAME = 'safety-training-v1.0.0'
const BASE_URL = '/safety-training-system'

// 需要缓存的核心资源
const CORE_ASSETS = [
  `${BASE_URL}/`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/favicon.svg`
]

// 需要缓存的页面路由
const ROUTES_TO_CACHE = [
  `${BASE_URL}/login`,
  `${BASE_URL}/dashboard`, 
  `${BASE_URL}/training`,
  `${BASE_URL}/archive`,
  `${BASE_URL}/standards`,
  `${BASE_URL}/statistics`,
  `${BASE_URL}/personal`
]

// 安装事件：缓存核心资源
self.addEventListener('install', event => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets')
        return cache.addAll(CORE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// 激活事件：清理旧缓存
self.addEventListener('activate', event => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// 拦截请求：实现缓存策略
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }

  // 对于导航请求（页面请求），使用网络优先策略
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 缓存成功的页面响应
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // 网络失败时，尝试从缓存获取
          return caches.match(request)
            .then(response => {
              if (response) {
                return response
              }
              // 如果缓存也没有，返回离线页面
              return caches.match(`${BASE_URL}/`)
            })
        })
    )
    return
  }

  // 对于静态资源，使用缓存优先策略
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response
          }
          return fetch(request)
            .then(response => {
              // 缓存新的静态资源
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(request, responseClone))
              }
              return response
            })
        })
    )
    return
  }

  // 对于API请求，使用网络优先策略
  if (url.pathname.startsWith(`${BASE_URL}/api/`)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 可以选择缓存某些API响应
          return response
        })
        .catch(() => {
          // API失败时的降级处理
          return new Response(
            JSON.stringify({ error: '网络连接失败，请检查网络设置' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }
})

// 后台同步（如果支持）
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 执行后台同步任务
      doBackgroundSync()
    )
  }
})

// 推送通知
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event)
  
  const options = {
    body: event.data ? event.data.text() : '您有新的通知',
    icon: `${BASE_URL}/icons/icon-192x192.png`,
    badge: `${BASE_URL}/icons/icon-72x72.png`,
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: `${BASE_URL}/icons/action-explore.png`
      },
      {
        action: 'close',
        title: '关闭',
        icon: `${BASE_URL}/icons/action-close.png`
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('安全培训系统', options)
  )
})

// 通知点击处理
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(`${BASE_URL}/dashboard`)
    )
  } else if (event.action === 'close') {
    // 关闭通知，不做其他操作
  } else {
    // 默认操作：打开应用
    event.waitUntil(
      clients.openWindow(`${BASE_URL}/`)
    )
  }
})

// 后台同步函数
async function doBackgroundSync() {
  try {
    // 这里可以实现数据同步逻辑
    console.log('[SW] Performing background sync...')
    
    // 例如：同步离线时收集的数据
    const offlineData = await getOfflineData()
    if (offlineData.length > 0) {
      await syncDataToServer(offlineData)
      await clearOfflineData()
    }
    
    console.log('[SW] Background sync completed')
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// 模拟数据同步函数
async function getOfflineData() {
  // 从IndexedDB或localStorage获取离线数据
  return []
}

async function syncDataToServer(data) {
  // 将数据同步到服务器
  console.log('[SW] Syncing data to server:', data)
}

async function clearOfflineData() {
  // 清理已同步的离线数据
  console.log('[SW] Clearing offline data')
}

// 版本更新通知
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})