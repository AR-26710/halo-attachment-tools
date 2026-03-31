import {ref, watch} from 'vue'
import {COMPRESS_CONFIG_STORAGE_KEY} from '@/constants'
import {compressImage, ConcurrencyLimiter} from '@/utils'
import type {CompressConfig} from '@/utils/imageCompress'

const DEFAULT_QUALITY = 0.85
const DEFAULT_MAX_WIDTH = 1920
const DEFAULT_MAX_HEIGHT = 1080
const DEFAULT_MAX_CONCURRENT = 3

function loadCompressConfig(): CompressConfig {
  try {
    const stored = localStorage.getItem(COMPRESS_CONFIG_STORAGE_KEY)
    if (stored) {
      const config = JSON.parse(stored)
      return {
        enabled: config.enabled ?? false,
        quality: config.quality ?? DEFAULT_QUALITY,
        maxWidth: config.maxWidth ?? DEFAULT_MAX_WIDTH,
        maxHeight: config.maxHeight ?? DEFAULT_MAX_HEIGHT,
        keepOriginalFormat: config.keepOriginalFormat ?? true,
        maxConcurrent: config.maxConcurrent ?? DEFAULT_MAX_CONCURRENT,
      }
    }
  } catch {
    console.error('Failed to load compress config')
  }
  return {
    enabled: false,
    quality: DEFAULT_QUALITY,
    maxWidth: DEFAULT_MAX_WIDTH,
    maxHeight: DEFAULT_MAX_HEIGHT,
    keepOriginalFormat: true,
    maxConcurrent: DEFAULT_MAX_CONCURRENT,
  }
}

function saveCompressConfig(config: CompressConfig): void {
  try {
    localStorage.setItem(COMPRESS_CONFIG_STORAGE_KEY, JSON.stringify(config))
  } catch {
    console.error('Failed to save compress config')
  }
}

export function useFileCompress() {
  const config = loadCompressConfig()
  const enabled = ref(config.enabled)
  const quality = ref(config.quality)
  const maxWidth = ref(config.maxWidth)
  const maxHeight = ref(config.maxHeight)
  const keepOriginalFormat = ref(config.keepOriginalFormat)
  const maxConcurrent = ref(config.maxConcurrent)
  const compressing = ref(false)

  const limiter = new ConcurrencyLimiter(maxConcurrent.value)

  watch([enabled, quality, maxWidth, maxHeight, keepOriginalFormat, maxConcurrent], ([newEnabled, newQuality, newMaxWidth, newMaxHeight, newKeepOriginalFormat, newMaxConcurrent]) => {
    limiter.setMaxConcurrent(newMaxConcurrent)
    saveCompressConfig({
      enabled: newEnabled,
      quality: newQuality,
      maxWidth: newMaxWidth,
      maxHeight: newMaxHeight,
      keepOriginalFormat: newKeepOriginalFormat,
      maxConcurrent: newMaxConcurrent,
    })
  }, { deep: true })

  async function compress(file: File): Promise<File> {
    if (!enabled.value) {
      return file
    }

    compressing.value = true
    try {
      return await limiter.run(async () => {
        return await compressImage(
            file,
            quality.value,
            maxWidth.value,
            maxHeight.value,
            keepOriginalFormat.value
        )
      })
    } finally {
      compressing.value = false
    }
  }

  return {
    enabled,
    quality,
    maxWidth,
    maxHeight,
    keepOriginalFormat,
    maxConcurrent,
    compressing,
    compress,
  }
}
