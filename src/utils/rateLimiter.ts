export interface RateLimiterConfig {
  maxRequests: number
  windowMs: number
  minDelay?: number
}

interface RequestRecord {
  timestamp: number
}

export class RateLimiter {
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly minDelay: number
  private requests: RequestRecord[] = []
  private lastRequestTime = 0
  private onWait?: (waitTimeMs: number) => void

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests
    this.windowMs = config.windowMs
    this.minDelay = config.minDelay ?? 0
  }

  setOnWaitCallback(callback: (waitTimeMs: number) => void): void {
    this.onWait = callback
  }

  private cleanOldRequests(): void {
    const now = Date.now()
    const cutoff = now - this.windowMs
    this.requests = this.requests.filter((req) => req.timestamp > cutoff)
  }

  private getCurrentCount(): number {
    this.cleanOldRequests()
    return this.requests.length
  }

  canMakeRequest(): boolean {
    return this.getCurrentCount() < this.maxRequests
  }

  getWaitTimeMs(): number {
    if (this.canMakeRequest()) {
      return 0
    }
    const now = Date.now()
    const oldestRequest = this.requests[0]
    if (oldestRequest) {
      return Math.max(0, oldestRequest.timestamp + this.windowMs - now + 10)
    }
    return 0
  }

  async waitForSlot(): Promise<void> {
    while (!this.canMakeRequest()) {
      const waitTime = this.getWaitTimeMs()
      if (waitTime > 0 && this.onWait) {
        this.onWait(waitTime)
      }
      if (waitTime > 0) {
        await this.delay(waitTime)
      }
      this.cleanOldRequests()
    }

    if (this.minDelay > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.minDelay) {
        await this.delay(this.minDelay - timeSinceLastRequest)
      }
    }
  }

  recordRequest(): void {
    this.requests.push({ timestamp: Date.now() })
    this.lastRequestTime = Date.now()
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const defaultRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  minDelay: 100,
})

export const uploadRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  minDelay: 200,
})
