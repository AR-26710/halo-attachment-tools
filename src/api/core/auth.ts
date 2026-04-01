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

  async saveAuthConfig(config: AuthConfig): Promise<void> {
    this.authConfig = config
    this.clearAllAuthStorage()

    const encrypted = await encryptData(JSON.stringify(config))
    const storage = config.rememberAuth ? localStorage : sessionStorage
    const key = config.rememberAuth ? AUTH_STORAGE_KEY : AUTH_SESSION_KEY

    storage.setItem(key, encrypted)
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
    if (!this.authConfig) return {}

    const { type, pat, username, password } = this.authConfig

    if (type === 'pat' && pat) {
      return { Authorization: `Bearer ${pat}` }
    }

    if (type === 'basic' && username && password) {
      const credentials = btoa(`${username}:${password}`)
      return { Authorization: `Basic ${credentials}` }
    }

    return {}
  }

  validateConfig(): { valid: boolean; error?: string } {
    if (!this.authConfig) {
      return { valid: false, error: '未配置认证信息' }
    }

    const { siteUrl, type, pat, username, password } = this.authConfig

    const urlError = this.validateUrl(siteUrl)
    if (urlError) return urlError

    if (type === 'pat') {
      if (!pat?.trim()) {
        return { valid: false, error: '个人令牌不能为空' }
      }
    }

    if (type === 'basic') {
      if (!username?.trim() || !password?.trim()) {
        return { valid: false, error: '用户名和密码不能为空' }
      }
    }

    return { valid: true }
  }

  private async loadAuthConfig(): Promise<void> {
    const stored = this.getStoredAuthData()
    if (!stored) return

    try {
      const decrypted = await decryptData(stored)
      this.authConfig = JSON.parse(decrypted)
    } catch (error) {
      console.error('Failed to parse stored auth config:', error)
      this.clearAuthConfig()
    }
  }

  private getStoredAuthData(): string | null {
    return sessionStorage.getItem(AUTH_SESSION_KEY) ?? localStorage.getItem(AUTH_STORAGE_KEY)
  }

  private clearAllAuthStorage(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_SESSION_KEY)
  }

  private validateUrl(url: string): { valid: false; error: string } | null {
    if (!url?.trim()) {
      return { valid: false, error: '站点地址不能为空' }
    }

    try {
      new URL(url)
      return null
    } catch {
      return { valid: false, error: '站点地址格式不正确' }
    }
  }
}