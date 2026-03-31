export interface ConcurrencyConfig {
  maxConcurrent: number
}

const DEFAULT_MAX_CONCURRENT = 3

export class ConcurrencyLimiter {
  private maxConcurrent: number
  private activeCount = 0
  private queue: Array<() => void> = []

  constructor(maxConcurrent: number = DEFAULT_MAX_CONCURRENT) {
    this.maxConcurrent = maxConcurrent
  }

  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max
  }
  async acquire(): Promise<void> {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++
      return
    }

    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.activeCount++
        resolve()
      })
    })
  }

  release(): void {
    this.activeCount--
    const next = this.queue.shift()
    if (next) {
      next()
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      return await fn()
    } finally {
      this.release()
    }
  }
  clear(): void {
    this.queue = []
  }
}

export function createConcurrencyLimiter(maxConcurrent: number = DEFAULT_MAX_CONCURRENT): ConcurrencyLimiter {
  return new ConcurrencyLimiter(maxConcurrent)
}
