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

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function useFileSelect() {
  const files = ref<FileItem[]>([])
  const isDragging = ref(false)

  function createFileItem(file: File): FileItem {
    return {
      file,
      id: generateId(),
      originalFileName: file.name,
    }
  }

  function addFiles(newFiles: FileList | null): null {
    if (!newFiles) return null

    const fileItems = Array.from(newFiles).map(createFileItem)
    files.value = [...files.value, ...fileItems]
    return null
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
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
    clearFiles,
  }
}
