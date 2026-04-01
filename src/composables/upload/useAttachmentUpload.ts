import { ref, computed, onMounted, watch } from 'vue'
import { useAuthConnection } from '@/composables/auth'
import { useUploadCore, useFileSelect} from '@/composables'

import { useFileRename, useFileConvert, useFileCompress } from '@/composables/file'
import type { FileItem } from '@/composables/upload/useFileSelect'

export function useAttachmentUpload() {
  const {
    isAuthenticated,
    authConfig,
    initAuth,
  } = useAuthConnection()

  const {
    policies,
    policyTemplates,
    groups,
    selectedPolicy,
    selectedGroup,
    loading,
    uploading,
    uploadProgress,
    hasPolicies,
    isRateLimited,
    rateLimitWaitTime,
    loadData,
    refreshData,
    uploadSingleFile: uploadSingleFileCore,
    uploadFiles: uploadFilesCore,
  } = useUploadCore()

  const fileSelect = useFileSelect()
  const originalFiles = fileSelect.files

  const {
    mode: renameMode,
    template: renameTemplate,
    isCustomMode,
    getRenamedFile,
    getFileWithName,
    getPreviewFilename,
    rename,
  } = useFileRename()

  const {
    enabled: convertEnabled,
    quality: convertQuality,
    maxConcurrent: convertMaxConcurrent,
    converting,
    convert,
  } = useFileConvert()

  const {
    enabled: compressEnabled,
    quality: compressQuality,
    maxWidth: compressMaxWidth,
    maxHeight: compressMaxHeight,
    keepOriginalFormat: compressKeepOriginalFormat,
    maxConcurrent: compressMaxConcurrent,
    compressing,
    compress,
  } = useFileCompress()

  const showAuthModal = ref(false)

  const templatePreview = computed(() => getPreviewFilename())

  function updateRenamedFileName(fileItem: FileItem) {
    if (isCustomMode.value) {
      fileItem.renamedFileName = rename(fileItem.originalFileName)
    } else {
      fileItem.renamedFileName = undefined
    }
  }

  function openAuthModal() {
    showAuthModal.value = true
  }

  function closeAuthModal() {
    showAuthModal.value = false
  }

  function handleAuthSaved() {
    loadData()
  }

  async function processFile(file: File, fileItem?: FileItem): Promise<File> {
    let processedFile = file
    if (compressEnabled.value) {
      processedFile = await compress(processedFile)
    }
    const convertedFile = await convert(processedFile)
    if (fileItem?.renamedFileName) {
      return getFileWithName(convertedFile, fileItem.renamedFileName)
    }
    return getRenamedFile(convertedFile)
  }

  function handleFileSelect(event: Event) {
    fileSelect.handleFileSelect(event)
    originalFiles.value.forEach(updateRenamedFileName)
  }

  function handleDrop(event: DragEvent) {
    fileSelect.handleDrop(event)
    originalFiles.value.forEach(updateRenamedFileName)
  }

  function removeFile(id: string) {
    fileSelect.removeFile(id)
  }

  function clearFiles() {
    fileSelect.clearFiles()
  }

  watch([renameMode, renameTemplate], () => {
    originalFiles.value.forEach(updateRenamedFileName)
  }, { deep: true })

  async function handleUpload() {
    const pendingFiles = originalFiles.value.filter(f => f.status !== 'success')
    if (pendingFiles.length === 0) return
    await uploadFilesCore(pendingFiles, processFile)
  }

  watch(uploading, (newVal) => {
    if (!newVal) { /* empty */ }
  })

  async function handleSingleUpload(id: string) {
    const fileItem = originalFiles.value.find(f => f.id === id)
    if (!fileItem || !selectedPolicy.value) return

    fileItem.status = 'uploading'
    fileItem.progress = 0

    try {
      let processedFile: File = fileItem.file
      if (compressEnabled.value) {
        processedFile = await compress(processedFile)
      }
      if (convertEnabled.value) {
        processedFile = await convert(processedFile)
      }
      if (fileItem.renamedFileName) {
        processedFile = getFileWithName(processedFile, fileItem.renamedFileName)
      } else {
        processedFile = getRenamedFile(processedFile)
      }

      const result = await uploadSingleFileCore(processedFile, {
        policyName: selectedPolicy.value,
        groupName: selectedGroup.value || undefined,
        onProgress: (progress) => {
          fileItem.progress = progress
        },
      })

      if (result.success) {
        fileItem.status = 'success'
        fileItem.attachment = result.attachment
      } else {
        fileItem.status = 'error'
        fileItem.error = result.error
      }
    } catch (error) {
      fileItem.status = 'error'
      fileItem.error = error instanceof Error ? error.message : '上传失败'
    }
  }

  async function handlePolicyOrGroupCreated() {
    await refreshData()
  }

  onMounted(async () => {
    await initAuth()
    if (isAuthenticated.value) {
      await loadData()
    }
  })

  return {
    isAuthenticated,
    authConfig,
    policies,
    policyTemplates,
    groups,
    selectedPolicy,
    selectedGroup,
    loading,
    uploading,
    uploadProgress,
    hasPolicies,
    isRateLimited,
    rateLimitWaitTime,
    files: originalFiles,
    isDragging: fileSelect.isDragging,
    renameMode,
    renameTemplate,
    isCustomMode,
    templatePreview,
    convertEnabled,
    convertQuality,
    convertMaxConcurrent,
    converting,
    compressEnabled,
    compressQuality,
    compressMaxWidth,
    compressMaxHeight,
    compressKeepOriginalFormat,
    compressMaxConcurrent,
    compressing,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    handleAuthSaved,
    handleFileSelect,
    handleDrop,
    handleDragOver: fileSelect.handleDragOver,
    handleDragLeave: fileSelect.handleDragLeave,
    removeFile,
    clearFiles,
    handleUpload,
    handleSingleUpload,
    handlePolicyOrGroupCreated,
  }
}
