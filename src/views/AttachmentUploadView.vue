<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

import { AuthCard, AuthModal } from '@/components/features/auth'
import { useAttachmentUpload } from '@/composables/upload'

import { PolicySelector, GroupSelector, UploadConfigModal, EmptyState, QuickLinkPanel } from '@/components/features'
import { FileDropZone, FileList, Skeleton } from '@/components/ui'

const {
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
  files,
  isDragging,
  renameMode,
  renameTemplate,
  convertEnabled,
  convertQuality,
  convertMaxConcurrent,
  compressEnabled,
  compressQuality,
  compressMaxWidth,
  compressMaxHeight,
  compressKeepOriginalFormat,
  compressMaxConcurrent,
  quickLinkEnabled,
  showAuthModal,
  openAuthModal,
  closeAuthModal,
  handleAuthSaved,
  handleFileSelect,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  removeFile,
  clearFiles,
  handleUpload,
  handleSingleUpload,
  handlePolicyOrGroupCreated,
} = useAttachmentUpload()

const showConfigModal = ref(false)

const buttonText = computed(() => {
  return uploading.value ? `上传中 ${uploadProgress.value}%` : '开始上传'
})

function openConfigModal() {
  showConfigModal.value = true
}

function closeConfigModal() {
  showConfigModal.value = false
}

defineExpose({
  openConfigModal,
})
</script>

<template>
  <div class="space-y-4 md:space-y-6 py-2">
    <AuthCard
      :is-authenticated="isAuthenticated"
      :site-url="authConfig?.siteUrl"
      @configure="openAuthModal"
      @open-upload-config="openConfigModal"
    />

    <template v-if="isAuthenticated">
      <div v-if="loading" class="space-y-4">
        <div class="card bg-base-100 border border-base-300 rounded-xl">
          <div class="card-body p-4">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="rounded" height="60px" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div class="card bg-base-100 border border-base-300 rounded-xl p-4">
            <Skeleton variant="text" width="40%" class="mb-2" />
            <Skeleton variant="rounded" height="40px" />
          </div>
          <div class="card bg-base-100 border border-base-300 rounded-xl p-4">
            <Skeleton variant="text" width="40%" class="mb-2" />
            <Skeleton variant="rounded" height="40px" />
          </div>
        </div>
        <div class="card bg-base-100 border border-base-300 rounded-xl p-6">
          <div class="flex flex-col items-center">
            <Skeleton variant="circular" width="80px" height="80px" class="mb-4" />
            <Skeleton variant="text" width="50%" class="mb-2" />
            <Skeleton variant="text" width="30%" />
          </div>
        </div>
      </div>

      <template v-else>
        <div v-if="!hasPolicies" class="alert alert-warning text-sm shadow-md">
          <Icon icon="mdi:alert-outline" class="h-4 w-4 md:h-5 md:w-5" />
          <span>未找到存储策略，请先在 Halo 后台创建存储策略或点击下方按钮创建</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <PolicySelector
            v-model="selectedPolicy"
            :policies="policies"
            :policy-templates="policyTemplates"
            :disabled="uploading"
            @created="handlePolicyOrGroupCreated"
          />

          <GroupSelector
            v-model="selectedGroup"
            :groups="groups"
            :disabled="uploading"
            @created="handlePolicyOrGroupCreated"
          />
        </div>

        <FileDropZone
          :is-dragging="isDragging"
          :disabled="uploading"
          :file-count="files.length"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @file-select="handleFileSelect"
        />

        <FileList
          :files="files"
          :disabled="uploading"
          @remove="removeFile"
          @clear="clearFiles"
          @upload="handleSingleUpload"
        />

        <QuickLinkPanel v-if="quickLinkEnabled" :files="files" :site-url="authConfig?.siteUrl" />

        <div v-if="files.length > 0" class="flex justify-center pt-2">
          <button
            class="btn btn-primary btn-wide btn-sm md:btn-md shadow-lg"
            :disabled="!selectedPolicy || uploading"
            @click="handleUpload"
          >
            <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
            {{ buttonText }}
          </button>
        </div>

      </template>
    </template>

    <EmptyState
      v-else
      title="未连接到 Halo 站点"
      description="请先配置站点连接以开始使用上传功能"
      action-label="配置连接"
      @action="openAuthModal"
    />

    <UploadConfigModal
      :show="showConfigModal"
      :disabled="uploading"
      :rename-mode="renameMode"
      :rename-template="renameTemplate"
      :convert-enabled="convertEnabled"
      :convert-quality="convertQuality"
      :convert-max-concurrent="convertMaxConcurrent"
      :compress-enabled="compressEnabled"
      :compress-quality="compressQuality"
      :compress-max-width="compressMaxWidth"
      :compress-max-height="compressMaxHeight"
      :compress-keep-original-format="compressKeepOriginalFormat"
      :compress-max-concurrent="compressMaxConcurrent"
      :quick-link-enabled="quickLinkEnabled"
      @close="closeConfigModal"
      @update:rename-mode="renameMode = $event"
      @update:rename-template="renameTemplate = $event"
      @update:convert-enabled="convertEnabled = $event"
      @update:convert-quality="convertQuality = $event"
      @update:convert-max-concurrent="convertMaxConcurrent = $event"
      @update:compress-enabled="compressEnabled = $event"
      @update:compress-quality="compressQuality = $event"
      @update:compress-max-width="compressMaxWidth = $event"
      @update:compress-max-height="compressMaxHeight = $event"
      @update:compress-keep-original-format="compressKeepOriginalFormat = $event"
      @update:compress-max-concurrent="compressMaxConcurrent = $event"
      @update:quick-link-enabled="quickLinkEnabled = $event"
    />

    <AuthModal
      :show="showAuthModal"
      :initial-config="authConfig"
      @close="closeAuthModal"
      @saved="handleAuthSaved"
      @cleared="clearFiles"
    />
  </div>
</template>

<style scoped>
.space-y-4 > * {
  transition: all 0.3s ease;
}

.btn {
  transition: all 0.2s ease;
  transform: scale(1);
}

.btn:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.alert {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.space-y-4 > *),
:deep(.space-y-6 > *) {
  min-height: 0;
}
</style>
