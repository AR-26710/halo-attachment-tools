import type { AuthConfig } from '@/types'
import { AuthManager, ApiClient } from './core'
import { PolicyApi, GroupApi, AttachmentApi } from './modules'

export class HaloApiService {
  private readonly authManager: AuthManager
  private readonly apiClient: ApiClient
  private readonly policyApi: PolicyApi
  private readonly groupApi: GroupApi
  private readonly attachmentApi: AttachmentApi

  constructor() {
    this.authManager = new AuthManager()
    this.apiClient = new ApiClient(this.authManager)
    this.policyApi = new PolicyApi(this.apiClient)
    this.groupApi = new GroupApi(this.apiClient)
    this.attachmentApi = new AttachmentApi(this.apiClient)
  }

  async ready(): Promise<void> {
    await this.authManager.ready()
    this.apiClient.init()
  }

  private ensureAuthenticated(): void {
    if (!this.apiClient.isReady()) {
      throw new Error('未认证')
    }
  }

  async saveAuthConfig(config: AuthConfig): Promise<void> {
    await this.authManager.saveAuthConfig(config)
    this.apiClient.init()
  }

  clearAuthConfig(): void {
    this.authManager.clearAuthConfig()
    this.apiClient.clear()
  }

  getAuthConfig(): AuthConfig | null {
    return this.authManager.getAuthConfig()
  }

  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated() && this.apiClient.isReady()
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const validation = this.authManager.validateConfig()
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    if (!this.apiClient.isReady()) {
      return { success: false, error: '客户端初始化失败' }
    }

    try {
      await this.apiClient.request(async () => {
        await this.apiClient.getClient().get('/apis/api.console.halo.run/v1alpha1/attachments', {
          params: { page: 0, size: 1 }
        })
      })
      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: '未知错误' }
    }
  }

  get policies() {
    this.ensureAuthenticated()
    return this.policyApi
  }

  get groups() {
    this.ensureAuthenticated()
    return this.groupApi
  }

  get attachments() {
    this.ensureAuthenticated()
    return this.attachmentApi
  }
}

export const haloApi = new HaloApiService()
