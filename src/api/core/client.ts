import axios, { isAxiosError } from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import type { AuthManager } from './auth'

const ERROR_MESSAGES = {
  UNAUTHORIZED: '认证失败，请检查认证信息',
  FORBIDDEN: '权限不足',
  NETWORK_ERROR: '无法连接到服务器，请检查配置是否正确',
  UNKNOWN: '未知错误',
  CLIENT_NOT_INITIALIZED: '客户端未初始化',
} as const

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const

const AXIOS_ERROR_CODES = {
  NETWORK: 'ERR_NETWORK',
  CONNECTION_REFUSED: 'ECONNREFUSED',
} as const

export class ApiClient {
  private client: AxiosInstance | null = null
  private readonly authManager: AuthManager

  constructor(authManager: AuthManager) {
    this.authManager = authManager
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
      (error) => this.handleError(error)
    )
  }

  private handleError(error: unknown): Promise<never> {
    if (!isAxiosError(error)) {
      return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN))
    }

    const message = this.resolveErrorMessage(error)
    return Promise.reject(new Error(message))
  }

  private resolveErrorMessage(error: AxiosError): string {
    const status = error.response?.status
    const responseData = error.response?.data
    const responseMessage = typeof responseData === 'object' && responseData !== null && 'message' in responseData
      ? String(responseData.message)
      : undefined

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      return ERROR_MESSAGES.UNAUTHORIZED
    }

    if (status === HTTP_STATUS.FORBIDDEN) {
      return ERROR_MESSAGES.FORBIDDEN
    }

    if (error.code === AXIOS_ERROR_CODES.NETWORK || error.code === AXIOS_ERROR_CODES.CONNECTION_REFUSED) {
      return ERROR_MESSAGES.NETWORK_ERROR
    }

    return responseMessage || error.message || ERROR_MESSAGES.UNKNOWN
  }

  getClient(): AxiosInstance {
    if (!this.client) {
      throw new Error(ERROR_MESSAGES.CLIENT_NOT_INITIALIZED)
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
    return execute()
  }

  async upload<T>(execute: () => Promise<T>): Promise<T> {
    return execute()
  }
}
