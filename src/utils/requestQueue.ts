import type { RateLimiter } from './rateLimiter'

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  retryableStatusCodes: number[]
}

interface QueueItem<T> {
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
  retries: number
  priority: number
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatusCodes: [429, 500, 502, 503, 504],
}

export class RequestQueue {
  private queue: QueueItem<unknown>[] = []
  private processing = false
  private readonly rateLimiter: RateLimiter
  private readonly retryConfig: RetryConfig
  private activeRequests = 0
  private readonly maxConcurrent: number

  constructor(
    rateLimiter: RateLimiter,
    retryConfig: Partial<RetryConfig> = {},
    maxConcurrent = 5
  ) {
    this.rateLimiter = rateLimiter
    this.retryConfig = { ...defaultRetryConfig, ...retryConfig }
    this.maxConcurrent = maxConcurrent
  }

  async enqueue<T>(
    execute: () => Promise<T>,
    priority = 0
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueueItem<T> = {
        execute,
        resolve: resolve as (value: unknown) => void,
        reject,
        retries: 0,
        priority,
      }

      this.insertByPriority(item)
      this.processQueue()
    })
  }

  private insertByPriority<T>(item: QueueItem<T>): void {
    let insertIndex = this.queue.length
    for (let i = 0; i < this.queue.length; i++) {
      if (item.priority > (this.queue[i]?.priority ?? 0)) {
        insertIndex = i
        break
      }
    }
    this.queue.splice(insertIndex, 0, item as QueueItem<unknown>)
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const item = this.queue.shift()
      if (!item) break

      this.activeRequests++
      this.executeItem(item).finally(() => {
        this.activeRequests--
        this.processQueue()
      })
    }

    this.processing = false
  }

  private async executeItem(item: QueueItem<unknown>): Promise<void> {
    try {
      await this.rateLimiter.waitForSlot()
      this.rateLimiter.recordRequest()

      const result = await item.execute()
      item.resolve(result)
    } catch (error) {
      const shouldRetry = this.shouldRetry(error, item.retries)

      if (shouldRetry && item.retries < this.retryConfig.maxRetries) {
        item.retries++
        const delay = this.calculateDelay(item.retries)
        await this.delay(delay)

        this.insertByPriority(item)
        await this.processQueue()
      } else {
        item.reject(error instanceof Error ? error : new Error(String(error)))
      }
    }
  }

  private shouldRetry(error: unknown, retries: number): boolean {
    if (retries >= this.retryConfig.maxRetries) return false

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      const status = axiosError.response?.status
      if (status && this.retryConfig.retryableStatusCodes.includes(status)) {
        return true
      }
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const networkError = error as { code?: string }
      if (networkError.code === 'ECONNRESET' || networkError.code === 'ETIMEDOUT') {
        return true
      }
    }

    return false
  }

  private calculateDelay(retry: number): number {
    const exponentialDelay = this.retryConfig.baseDelay * Math.pow(2, retry - 1)
    const jitter = Math.random() * 0.1 * exponentialDelay
    const delay = exponentialDelay + jitter
    return Math.min(delay, this.retryConfig.maxDelay)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  clear(): void {
    this.queue.forEach((item) => {
      item.reject(new Error('Request cancelled'))
    })
    this.queue = []
  }
}
