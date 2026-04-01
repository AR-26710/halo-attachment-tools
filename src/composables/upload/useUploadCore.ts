import { ref, computed, onMounted } from 'vue'
import { haloApi } from '@/api'
import { POLICY_LABELS, GROUP_LABELS } from '@/constants'
import type { Policy, PolicyTemplate, Group, Attachment } from '@/types'
import type { FileItem } from '@/composables'

interface UploadResultItem {
  file: string
  success: boolean
  attachment?: Attachment
  error?: string
}

interface UploadOptions {
  policyName: string
  groupName?: string
  onProgress?: (progress: number) => void
}

const DEFAULT_CONCURRENT_LIMIT = 3

async function uploadSingleFile(
  file: File,
  options: UploadOptions
): Promise<UploadResultItem> {
  try {
    const attachment = await haloApi.attachments.uploadFile(
      file,
      options.policyName,
      options.groupName,
      options.onProgress
    )

    return {
      file: file.name,
      success: true,
      attachment,
    }
  } catch (error) {
    return {
      file: file.name,
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    }
  }
}

export function useUploadCore() {
  const allPolicies = ref<Policy[]>([])
  const allPolicyTemplates = ref<PolicyTemplate[]>([])
  const allGroups = ref<Group[]>([])
  const selectedPolicy = ref('')
  const selectedGroup = ref('')
  const concurrentLimit = ref(DEFAULT_CONCURRENT_LIMIT)

  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const rateLimitWaitTime = ref(0)
  const isRateLimited = computed(() => rateLimitWaitTime.value > 0)

  const policies = computed(() => {
    return allPolicies.value.filter((policy) => {
      return policy.metadata.labels?.[POLICY_LABELS.HIDDEN] !== 'true'
    })
  })

  const policyTemplates = computed(() => {
    return allPolicyTemplates.value
  })

  const groups = computed(() => {
    return allGroups.value.filter((group) => {
      return group.metadata.labels?.[GROUP_LABELS.HIDDEN] !== 'true'
    })
  })

  const hasPolicies = computed(() => policies.value.length > 0)
  const hasGroups = computed(() => groups.value.length > 0)

  onMounted(() => {
    haloApi.setOnUploadRateLimitWait((waitTimeMs) => {
      rateLimitWaitTime.value = Math.ceil(waitTimeMs / 1000)
      if (waitTimeMs > 0) {
        const timer = setInterval(() => {
          rateLimitWaitTime.value = Math.max(0, rateLimitWaitTime.value - 1)
          if (rateLimitWaitTime.value <= 0) {
            clearInterval(timer)
          }
        }, 1000)
      }
    })
  })

  async function loadData(): Promise<void> {
    loading.value = true
    try {
      const [policiesResponse, groupsResponse, templatesResponse] = await Promise.all([
        haloApi.policies.getPolicies(),
        haloApi.groups.getGroups(),
        haloApi.policies.getPolicyTemplates()
      ])
      allPolicies.value = policiesResponse
      allGroups.value = groupsResponse
      allPolicyTemplates.value = templatesResponse

      const visiblePolicies = policies.value
      if (visiblePolicies.length > 0 && visiblePolicies[0]) {
        selectedPolicy.value = visiblePolicies[0].metadata.name
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function refreshData(): Promise<void> {
    await loadData()
  }

  async function uploadFiles(
    files: FileItem[],
    processFile?: (file: File, fileItem: FileItem) => Promise<File> | File
  ): Promise<UploadResultItem[]> {
    if (files.length === 0 || !selectedPolicy.value) {
      return []
    }

    uploading.value = true
    uploadProgress.value = 0
    rateLimitWaitTime.value = 0

    const results: UploadResultItem[] = []
    const pendingFiles = files.filter(fileItem => fileItem.status !== 'success')
    const totalFiles = pendingFiles.length
    let completedFiles = 0

    async function uploadFileWorker(fileItem: FileItem) {
      fileItem.status = 'uploading'
      fileItem.progress = 0

      try {
        let processedFile: File = fileItem.file

        if (processFile) {
          processedFile = await processFile(fileItem.file, fileItem)
        }

        const result = await uploadSingleFile(processedFile, {
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

        results.push(result)
      } catch (error) {
        fileItem.status = 'error'
        fileItem.error = error instanceof Error ? error.message : '上传失败'
        results.push({
          file: fileItem.file.name,
          success: false,
          error: fileItem.error,
        })
      } finally {
        completedFiles++
        uploadProgress.value = Math.round((completedFiles / totalFiles) * 100)
      }
    }

    const workers: Promise<void>[] = []
    let fileIndex = 0

    async function nextWorker() {
      while (fileIndex < pendingFiles.length) {
        const fileItem = pendingFiles[fileIndex++]
        await uploadFileWorker(fileItem)
      }
    }

    for (let i = 0; i < concurrentLimit.value && i < pendingFiles.length; i++) {
      workers.push(nextWorker())
    }

    await Promise.all(workers)

    uploading.value = false
    uploadProgress.value = 0
    rateLimitWaitTime.value = 0
    return results
  }

  return {
    policies,
    policyTemplates,
    groups,
    selectedPolicy,
    selectedGroup,
    concurrentLimit,
    loading,
    uploading,
    uploadProgress,
    isRateLimited,
    rateLimitWaitTime,
    hasPolicies,
    hasGroups,
    loadData,
    refreshData,
    uploadSingleFile,
    uploadFiles,
  }
}
