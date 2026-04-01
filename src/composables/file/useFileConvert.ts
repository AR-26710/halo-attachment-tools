import {ref, watch, computed} from 'vue'
import {CONVERT_CONFIG_STORAGE_KEY} from '@/constants'
import {ConcurrencyLimiter, convertToWebp} from '@/utils'
import type {ConvertConfig} from '@/utils/imageConvert'

const DEFAULT_QUALITY = 0.85
const DEFAULT_MAX_CONCURRENT = 3

function loadConvertConfig(): ConvertConfig {
  try {
    const stored = localStorage.getItem(CONVERT_CONFIG_STORAGE_KEY)
    if (stored) {
      const config = JSON.parse(stored)
      return {
        enabled: config.enabled ?? false,
        quality: config.quality ?? DEFAULT_QUALITY,
        maxConcurrent: config.maxConcurrent ?? DEFAULT_MAX_CONCURRENT,
      }
    }
  } catch {
    console.error('Failed to load convert config')
  }
  return { enabled: false, quality: DEFAULT_QUALITY, maxConcurrent: DEFAULT_MAX_CONCURRENT }
}

function saveConvertConfig(config: ConvertConfig): void {
  try {
    localStorage.setItem(CONVERT_CONFIG_STORAGE_KEY, JSON.stringify(config))
  } catch {
    console.error('Failed to save convert config')
  }
}

export function useFileConvert() {
  const config = loadConvertConfig()
  const enabled = ref(config.enabled)
  const quality = ref(config.quality)
  const maxConcurrent = ref(config.maxConcurrent)
  const convertingCount = ref(0)
  const converting = computed(() => convertingCount.value > 0)

  const limiter = new ConcurrencyLimiter(maxConcurrent.value)

  watch([enabled, quality, maxConcurrent], ([newEnabled, newQuality, newMaxConcurrent]) => {
    limiter.setMaxConcurrent(newMaxConcurrent)
    saveConvertConfig({ enabled: newEnabled, quality: newQuality, maxConcurrent: newMaxConcurrent })
  }, { deep: true })

  async function convert(file: File): Promise<File> {
    if (!enabled.value) {
      return file
    }

    convertingCount.value++
    try {
      return await limiter.run(async () => {
        return await convertToWebp(file, quality.value)
      })
    } finally {
      convertingCount.value--
    }
  }

  return {
    enabled,
    quality,
    maxConcurrent,
    converting,
    convert,
  }
}
