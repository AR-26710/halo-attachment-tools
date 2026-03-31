import { ref } from 'vue'
import type { Attachment } from '@/types'

export interface FileItem {
  file: File
  id: string
  originalFileName: string
  renamedFileName?: string
  status?: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  attachment?: Attachment
}

export interface FileSelectError {
  type: 'max_files_exceeded'
  message: string
  maxFiles: number
  attemptedCount: number
  currentCount: number
}

const MAX_FILES = 20

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function useFileSelect() {
  const files = ref<FileItem[]>([])
  const isDragging = ref(false)
  const lastError = ref<FileSelectError | null>(null)

  function createFileItem(file: File): FileItem {
    return {
      file,
      id: generateId(),
      originalFileName: file.name,
    }
  }

  function addFiles(newFiles: FileList | null): FileSelectError | null {
    if (!newFiles) return null

    const currentCount = files.value.length
    const newCount = newFiles.length
    const totalCount = currentCount + newCount

    if (totalCount > MAX_FILES) {
      const error: FileSelectError = {
        type: 'max_files_exceeded',
        message: `最多只能选择 ${MAX_FILES} 个文件，当前已有 ${currentCount} 个，尝试添加 ${newCount} 个`,
        maxFiles: MAX_FILES,
        attemptedCount: newCount,
        currentCount,
      }
      lastError.value = error
      return error
    }

    lastError.value = null
    const fileItems = Array.from(newFiles).map(createFileItem)
    files.value = [...files.value, ...fileItems]
    return null
  }

  function clearError(): void {
    lastError.value = null
  }

  function handleFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement
    addFiles(target.files)
    target.value = ''
  }

  function handleDrop(event: DragEvent): void {
    isDragging.value = false
    addFiles(event.dataTransfer?.files ?? null)
  }

  function handleDragOver(event: DragEvent): void {
    event.preventDefault()
    isDragging.value = true
  }

  function handleDragLeave(): void {
    isDragging.value = false
  }

  function removeFile(id: string): void {
    files.value = files.value.filter(f => f.id !== id)
  }

  function clearFiles(): void {
    files.value = []
  }

  return {
    files,
    isDragging,
    lastError,
    maxFiles: MAX_FILES,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
    clearFiles,
    clearError,
  }
}
