import { ref, watch, computed } from 'vue'
import { RENAME_CONFIG_STORAGE_KEY } from '@/constants'
import { renameFile as renameFileUtil } from '@/utils'

export type RenameMode = 'origin' | 'custom'

interface RenameConfig {
  mode: RenameMode
  template: string
}

const DEFAULT_TEMPLATE = '${origin-filename}-${uuid-no-dash}'

function loadRenameConfig(): RenameConfig {
  try {
    const stored = localStorage.getItem(RENAME_CONFIG_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.error('Failed to load rename config')
  }
  return { mode: 'origin', template: DEFAULT_TEMPLATE }
}

function saveRenameConfig(config: RenameConfig): void {
  try {
    localStorage.setItem(RENAME_CONFIG_STORAGE_KEY, JSON.stringify(config))
  } catch {
    console.error('Failed to save rename config')
  }
}

export function useFileRename() {
  const config = loadRenameConfig()
  const mode = ref<RenameMode>(config.mode)
  const template = ref(config.template)

  const isCustomMode = computed(() => mode.value === 'custom')

  watch([mode, template], ([newMode, newTemplate]) => {
    saveRenameConfig({ mode: newMode, template: newTemplate })
  }, { deep: true })

  function rename(originalFilename: string): string {
    if (mode.value === 'origin') {
      return originalFilename
    }
    return renameFileUtil(originalFilename, template.value)
  }

  function getRenamedFile(file: File): File {
    if (mode.value === 'origin') {
      return file
    }

    const newFilename = rename(file.name)
    return new File([file], newFilename, { type: file.type })
  }

  function getFileWithName(file: File, newFilename: string): File {
    return new File([file], newFilename, { type: file.type })
  }

  function getPreviewFilename(exampleName: string = 'example.png'): string {
    return rename(exampleName)
  }

  return {
    mode,
    template,
    isCustomMode,
    rename,
    getRenamedFile,
    getFileWithName,
    getPreviewFilename,
  }
}
