import axios, { isAxiosError } from 'axios'
import type { AxiosInstance } from 'axios'
import type { AuthManager } from './auth'
import { defaultRateLimiter, uploadRateLimiter } from '@/utils/rateLimiter'
import { RequestQueue } from '@/utils/requestQueue'

export class ApiClient {
  private client: AxiosInstance | null = null
  private readonly authManager: AuthManager
  private readonly requestQueue: RequestQueue
  private readonly uploadQueue: RequestQueue

  constructor(authManager: AuthManager) {
    this.authManager = authManager
    this.requestQueue = new RequestQueue(defaultRateLimiter, {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    }, 5)
    this.uploadQueue = new RequestQueue(uploadRateLimiter, {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 30000,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    }, 3)
  }

  init(): void {
    const authConfig = this.authManager.getAuthConfig()
    if (!authConfig) return

    this.client = axios.create({
      baseURL: authConfig.siteUrl.replace(/\/$/, ''),
      headers: this.authManager.getAuthHeaders(),
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    if (!this.client) return

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            return Promise.reject(new Error('认证失败，请检查认证信息'))
          }
          if (error.response?.status === 403) {
            return Promise.reject(new Error('权限不足'))
          }
          if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            return Promise.reject(new Error('无法连接到服务器，请检查配置是否正确'))
          }
          if (error.response?.data?.message) {
            return Promise.reject(new Error(error.response.data.message))
          }
          if (error.message) {
            return Promise.reject(new Error(error.message))
          }
        }
        return Promise.reject(new Error('未知错误'))
      }
    )
  }

  getClient(): AxiosInstance {
    if (!this.client) {
      throw new Error('客户端未初始化')
    }
    return this.client
  }

  isReady(): boolean {
    return this.client !== null
  }

  clear(): void {
    this.client = null
  }

  async request<T>(execute: () => Promise<T>): Promise<T> {
    return this.requestQueue.enqueue(execute)
  }

  async upload<T>(execute: () => Promise<T>, priority = 10): Promise<T> {
    return this.uploadQueue.enqueue(execute, priority)
  }
}
