import type { AuthConfig } from '@/types'
import { AUTH_STORAGE_KEY, AUTH_SESSION_KEY } from '@/constants'
import { encryptData, decryptData } from '@/utils'

export class AuthManager {
  private authConfig: AuthConfig | null = null
  private readonly initPromise: Promise<void>

  constructor() {
    this.initPromise = this.loadAuthConfig()
  }

  async ready(): Promise<void> {
    await this.initPromise
  }

  private async loadAuthConfig(): Promise<void> {
    const storedLocal = localStorage.getItem(AUTH_STORAGE_KEY)
    const storedSession = sessionStorage.getItem(AUTH_SESSION_KEY)
    const stored = storedSession || storedLocal

    if (stored) {
      try {
        const decrypted = await decryptData(stored)
        this.authConfig = JSON.parse(decrypted)
      } catch {
        console.error('Failed to parse stored auth config')
        this.clearAuthConfig()
      }
    }
  }

  async saveAuthConfig(config: AuthConfig): Promise<void> {
    this.authConfig = config
    this.clearAllAuthStorage()
    const encrypted = await encryptData(JSON.stringify(config))

    if (config.rememberAuth) {
      localStorage.setItem(AUTH_STORAGE_KEY, encrypted)
    } else {
      sessionStorage.setItem(AUTH_SESSION_KEY, encrypted)
    }
  }

  private clearAllAuthStorage(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_SESSION_KEY)
  }

  clearAuthConfig(): void {
    this.authConfig = null
    this.clearAllAuthStorage()
  }

  getAuthConfig(): AuthConfig | null {
    return this.authConfig
  }

  isAuthenticated(): boolean {
    return this.authConfig !== null
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (!this.authConfig) return headers

    if (this.authConfig.type === 'pat' && this.authConfig.pat) {
      headers['Authorization'] = `Bearer ${this.authConfig.pat}`
    } else if (this.authConfig.type === 'basic' && this.authConfig.username && this.authConfig.password) {
      const credentials = btoa(`${this.authConfig.username}:${this.authConfig.password}`)
      headers['Authorization'] = `Basic ${credentials}`
    }

    return headers
  }

  validateConfig(): { valid: boolean; error?: string } {
    if (!this.authConfig) {
      return { valid: false, error: '未配置认证信息' }
    }

    const { siteUrl, type, pat, username, password } = this.authConfig

    if (!siteUrl?.trim()) {
      return { valid: false, error: '站点地址不能为空' }
    }

    try {
      new URL(siteUrl)
    } catch {
      return { valid: false, error: '站点地址格式不正确' }
    }

    if (type === 'pat' && (!pat?.trim())) {
      return { valid: false, error: '个人令牌不能为空' }
    }

    if (type === 'basic' && (!username?.trim() || !password?.trim())) {
      return { valid: false, error: '用户名和密码不能为空' }
    }

    return { valid: true }
  }
}
