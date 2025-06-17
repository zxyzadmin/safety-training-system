// 缓存管理工具
export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number // 生存时间（毫秒）
  hits: number // 命中次数
  lastAccess: number // 最后访问时间
}

export interface CacheOptions {
  ttl?: number // 默认TTL（毫秒）
  maxSize?: number // 最大缓存项数
  storage?: 'memory' | 'localStorage' | 'sessionStorage' // 存储类型
  prefix?: string // 缓存键前缀
  serialize?: boolean // 是否序列化（localStorage/sessionStorage必须）
}

export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
  memoryUsage: number
}

// 内存缓存管理器
export class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private options: Required<CacheOptions>
  private stats = {
    hits: 0,
    misses: 0
  }

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 默认5分钟
      maxSize: options.maxSize || 100,
      storage: 'memory',
      prefix: options.prefix || 'cache_',
      serialize: false
    }
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheKey = this.getCacheKey(key)
    const now = Date.now()
    const itemTtl = ttl || this.options.ttl

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: itemTtl,
      hits: 0,
      lastAccess: now
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.options.maxSize && !this.cache.has(cacheKey)) {
      this.evictLRU()
    }

    this.cache.set(cacheKey, item)
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const cacheKey = this.getCacheKey(key)
    const item = this.cache.get(cacheKey) as CacheItem<T> | undefined

    if (!item) {
      this.stats.misses++
      return null
    }

    const now = Date.now()

    // 检查是否过期
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(cacheKey)
      this.stats.misses++
      return null
    }

    // 更新访问信息
    item.hits++
    item.lastAccess = now
    this.stats.hits++

    return item.data
  }

  // 删除缓存
  delete(key: string): boolean {
    const cacheKey = this.getCacheKey(key)
    return this.cache.delete(cacheKey)
  }

  // 检查是否存在
  has(key: string): boolean {
    const cacheKey = this.getCacheKey(key)
    const item = this.cache.get(cacheKey)
    
    if (!item) {
      return false
    }

    // 检查是否过期
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(cacheKey)
      return false
    }

    return true
  }

  // 清除所有缓存
  clear(): void {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
  }

  // 清除过期缓存
  clearExpired(): number {
    let cleared = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        cleared++
      }
    }

    return cleared
  }

  // LRU淘汰
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // 获取缓存键
  private getCacheKey(key: string): string {
    return this.options.prefix + key
  }

  // 获取统计信息
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    
    // 估算内存使用（简化计算）
    let memoryUsage = 0
    for (const item of this.cache.values()) {
      memoryUsage += JSON.stringify(item.data).length * 2 // 粗略估算
    }

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage
    }
  }

  // 获取所有缓存键
  keys(): string[] {
    return Array.from(this.cache.keys()).map(key => 
      key.startsWith(this.options.prefix) 
        ? key.slice(this.options.prefix.length)
        : key
    )
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size
  }
}

// 存储缓存管理器（localStorage/sessionStorage）
export class StorageCache {
  private storage: Storage
  private options: Required<CacheOptions>
  private stats = {
    hits: 0,
    misses: 0
  }

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000,
      maxSize: options.maxSize || 50,
      storage: options.storage || 'localStorage',
      prefix: options.prefix || 'cache_',
      serialize: true
    }

    this.storage = this.options.storage === 'localStorage' 
      ? localStorage 
      : sessionStorage
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const cacheKey = this.getCacheKey(key)
      const now = Date.now()
      const itemTtl = ttl || this.options.ttl

      const item: CacheItem<T> = {
        data,
        timestamp: now,
        ttl: itemTtl,
        hits: 0,
        lastAccess: now
      }

      const serialized = JSON.stringify(item)
      
      // 检查存储配额
      try {
        this.storage.setItem(cacheKey, serialized)
      } catch (e) {
        // 存储空间不足，清理一些旧缓存
        this.clearExpired()
        this.storage.setItem(cacheKey, serialized)
      }

      // 检查缓存数量限制
      this.enforceMaxSize()
    } catch (error) {
      console.warn('Cache set failed:', error)
    }
  }

  // 获取缓存
  get<T>(key: string): T | null {
    try {
      const cacheKey = this.getCacheKey(key)
      const serialized = this.storage.getItem(cacheKey)

      if (!serialized) {
        this.stats.misses++
        return null
      }

      const item: CacheItem<T> = JSON.parse(serialized)
      const now = Date.now()

      // 检查是否过期
      if (now - item.timestamp > item.ttl) {
        this.storage.removeItem(cacheKey)
        this.stats.misses++
        return null
      }

      // 更新访问信息
      item.hits++
      item.lastAccess = now
      this.storage.setItem(cacheKey, JSON.stringify(item))
      this.stats.hits++

      return item.data
    } catch (error) {
      console.warn('Cache get failed:', error)
      this.stats.misses++
      return null
    }
  }

  // 删除缓存
  delete(key: string): boolean {
    const cacheKey = this.getCacheKey(key)
    const existed = this.storage.getItem(cacheKey) !== null
    this.storage.removeItem(cacheKey)
    return existed
  }

  // 检查是否存在
  has(key: string): boolean {
    const cacheKey = this.getCacheKey(key)
    const serialized = this.storage.getItem(cacheKey)
    
    if (!serialized) {
      return false
    }

    try {
      const item: CacheItem = JSON.parse(serialized)
      const now = Date.now()
      
      if (now - item.timestamp > item.ttl) {
        this.storage.removeItem(cacheKey)
        return false
      }

      return true
    } catch (error) {
      this.storage.removeItem(cacheKey)
      return false
    }
  }

  // 清除所有缓存
  clear(): void {
    const keys = this.keys()
    keys.forEach(key => this.delete(key))
    this.stats.hits = 0
    this.stats.misses = 0
  }

  // 清除过期缓存
  clearExpired(): number {
    let cleared = 0
    const keys = this.keys()
    const now = Date.now()

    keys.forEach(key => {
      const cacheKey = this.getCacheKey(key)
      const serialized = this.storage.getItem(cacheKey)
      
      if (serialized) {
        try {
          const item: CacheItem = JSON.parse(serialized)
          if (now - item.timestamp > item.ttl) {
            this.storage.removeItem(cacheKey)
            cleared++
          }
        } catch (error) {
          this.storage.removeItem(cacheKey)
          cleared++
        }
      }
    })

    return cleared
  }

  // 强制执行最大大小限制
  private enforceMaxSize(): void {
    const keys = this.keys()
    if (keys.length <= this.options.maxSize) {
      return
    }

    // 按最后访问时间排序，删除最旧的
    const items = keys.map(key => {
      const cacheKey = this.getCacheKey(key)
      const serialized = this.storage.getItem(cacheKey)
      if (serialized) {
        try {
          const item: CacheItem = JSON.parse(serialized)
          return { key, lastAccess: item.lastAccess }
        } catch (error) {
          return { key, lastAccess: 0 }
        }
      }
      return { key, lastAccess: 0 }
    }).sort((a, b) => a.lastAccess - b.lastAccess)

    const toDelete = items.slice(0, keys.length - this.options.maxSize)
    toDelete.forEach(item => this.delete(item.key))
  }

  // 获取缓存键
  private getCacheKey(key: string): string {
    return this.options.prefix + key
  }

  // 获取所有缓存键
  keys(): string[] {
    const allKeys: string[] = []
    const prefix = this.options.prefix

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(prefix)) {
        allKeys.push(key.slice(prefix.length))
      }
    }

    return allKeys
  }

  // 获取统计信息
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    const keys = this.keys()
    
    // 估算内存使用
    let memoryUsage = 0
    keys.forEach(key => {
      const cacheKey = this.getCacheKey(key)
      const serialized = this.storage.getItem(cacheKey)
      if (serialized) {
        memoryUsage += serialized.length * 2 // UTF-16编码
      }
    })

    return {
      size: keys.length,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage
    }
  }
}

// 缓存管理器工厂
export class CacheManager {
  private caches = new Map<string, MemoryCache | StorageCache>()

  // 创建缓存实例
  createCache(name: string, options: CacheOptions = {}): MemoryCache | StorageCache {
    let cache: MemoryCache | StorageCache

    if (options.storage === 'localStorage' || options.storage === 'sessionStorage') {
      cache = new StorageCache(options)
    } else {
      cache = new MemoryCache(options)
    }

    this.caches.set(name, cache)
    return cache
  }

  // 获取缓存实例
  getCache(name: string): MemoryCache | StorageCache | undefined {
    return this.caches.get(name)
  }

  // 删除缓存实例
  deleteCache(name: string): boolean {
    const cache = this.caches.get(name)
    if (cache) {
      cache.clear()
      this.caches.delete(name)
      return true
    }
    return false
  }

  // 清除所有缓存
  clearAll(): void {
    this.caches.forEach(cache => cache.clear())
  }

  // 清除所有过期缓存
  clearAllExpired(): number {
    let totalCleared = 0
    this.caches.forEach(cache => {
      totalCleared += cache.clearExpired()
    })
    return totalCleared
  }

  // 获取所有缓存统计
  getAllStats(): { [name: string]: CacheStats } {
    const stats: { [name: string]: CacheStats } = {}
    this.caches.forEach((cache, name) => {
      stats[name] = cache.getStats()
    })
    return stats
  }

  // 获取缓存实例列表
  getCacheNames(): string[] {
    return Array.from(this.caches.keys())
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager()

// 创建预定义的缓存实例
export const memoryCache = cacheManager.createCache('memory', {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100
})

export const sessionCache = cacheManager.createCache('session', {
  storage: 'sessionStorage',
  ttl: 30 * 60 * 1000, // 30分钟
  maxSize: 50
})

export const persistentCache = cacheManager.createCache('persistent', {
  storage: 'localStorage',
  ttl: 24 * 60 * 60 * 1000, // 24小时
  maxSize: 30
})

// 装饰器：缓存函数结果
export function cached(
  cache: MemoryCache | StorageCache = memoryCache,
  keyGenerator?: (...args: any[]) => string,
  ttl?: number
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator 
        ? keyGenerator.apply(this, args)
        : `${target.constructor.name}.${propertyKey}.${JSON.stringify(args)}`

      // 尝试从缓存获取
      const cached = cache.get(key)
      if (cached !== null) {
        return cached
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)
      
      // 缓存结果
      cache.set(key, result, ttl)
      
      return result
    }

    return descriptor
  }
}

// 组合式API：使用缓存
export function useCache(name?: string, options?: CacheOptions) {
  const cache = name 
    ? cacheManager.getCache(name) || cacheManager.createCache(name, options)
    : memoryCache

  const get = <T>(key: string): T | null => cache.get<T>(key)
  const set = <T>(key: string, data: T, ttl?: number): void => cache.set(key, data, ttl)
  const remove = (key: string): boolean => cache.delete(key)
  const clear = (): void => cache.clear()
  const has = (key: string): boolean => cache.has(key)
  const stats = (): CacheStats => cache.getStats()

  return {
    get,
    set,
    remove,
    clear,
    has,
    stats
  }
}

// 自动清理过期缓存
let cleanupInterval: NodeJS.Timeout | null = null

export function startAutoCleanup(intervalMs = 5 * 60 * 1000): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }

  cleanupInterval = setInterval(() => {
    const cleared = cacheManager.clearAllExpired()
    if (cleared > 0) {
      console.log(`自动清理了 ${cleared} 个过期缓存项`)
    }
  }, intervalMs)
}

export function stopAutoCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}

// 在应用启动时自动开始清理
if (typeof window !== 'undefined') {
  startAutoCleanup()
}