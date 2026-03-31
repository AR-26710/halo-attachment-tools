<script setup lang="ts">
import type { FileItem } from '@/composables/upload'
import { formatFileSize, getFileIcon, getFileTypeName } from '@/utils'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = defineProps<{
  files: FileItem[]
  disabled?: boolean
}>()

defineEmits<{
  (e: 'remove', id: string): void
  (e: 'clear'): void
  (e: 'upload', id: string): void
}>()

const allUploaded = computed(() => {
  return props.files.length > 0 && props.files.every(f => f.status === 'success')
})

const pendingCount = computed(() => {
  return props.files.filter(f => f.status !== 'success').length
})

function getStatusIcon(status?: string) {
  switch (status) {
    case 'success':
      return 'mdi:check-circle'
    case 'error':
      return 'mdi:alert-circle'
    case 'uploading':
      return 'mdi:loading'
    default:
      return 'mdi:clock-outline'
  }
}

function getStatusClass(status?: string) {
  switch (status) {
    case 'success':
      return 'text-success'
    case 'error':
      return 'text-error'
    case 'uploading':
      return 'text-primary'
    default:
      return 'text-base-content/40'
  }
}

function getStatusIconClass(status?: string) {
  switch (status) {
    case 'uploading':
      return 'animate-spin'
    default:
      return ''
  }
}

function getStatusText(status?: string) {
  switch (status) {
    case 'success':
      return '已上传'
    case 'error':
      return '上传失败'
    case 'uploading':
      return '上传中'
    default:
      return '待上传'
  }
}
</script>

<template>
  <div v-if="files.length > 0" class="space-y-3 md:space-y-4">
    <div class="card bg-base-100 border border-base-300 overflow-hidden">
      <div class="card-body p-3 md:p-4">
        <div class="flex justify-between items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon icon="mdi:file-multiple" class="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 class="font-medium text-sm md:text-base leading-tight">
                {{ allUploaded ? '已上传文件' : '待上传文件' }}
              </h3>
              <div class="flex items-center gap-2 mt-0.5">
                <span v-if="!allUploaded" class="badge badge-sm badge-primary">
                  {{ pendingCount }} 个待上传
                </span>
                <span v-else class="badge badge-sm badge-success">
                  {{ files.length }} 个文件
                </span>
              </div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm text-error hover:bg-error/10" @click="$emit('clear')" :disabled="disabled">
            <Icon icon="mdi:delete-sweep" class="h-4 w-4 mr-1" />
            <span class="hidden sm:inline">清空</span>
          </button>
        </div>
      </div>
    </div>

    <div class="hidden md:block card bg-base-100 border border-base-300 overflow-hidden">
      <table class="table table-zebra">
        <thead class="bg-base-200/60">
          <tr>
            <th class="text-xs font-medium text-center">文件名</th>
            <th class="text-xs font-medium w-28 text-center">大小</th>
            <th class="text-xs font-medium w-36 text-center">类型</th>
            <th class="text-xs font-medium w-28 text-center">状态</th>
            <th class="text-xs font-medium w-28 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="fileItem in files"
            :key="fileItem.id"
            class="hover:bg-base-200/40 transition-colors"
            :class="{ 'opacity-60': fileItem.status === 'uploading' }"
          >
            <td class="max-w-[280px] lg:max-w-[360px]">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-base-200/80 flex items-center justify-center shrink-0">
                  <Icon :icon="getFileIcon(fileItem.file.type)" class="h-5 w-5 text-base-content/70" />
                </div>
                <div class="min-w-0 flex-1 overflow-hidden">
                  <span class="text-sm font-medium truncate block" :title="fileItem.renamedFileName || fileItem.file.name">
                    {{ fileItem.renamedFileName || fileItem.file.name }}
                  </span>
                  <span v-if="fileItem.renamedFileName" class="block text-xs text-base-content/50 truncate" :title="fileItem.originalFileName">
                    <Icon icon="mdi:arrow-left-right" class="h-3 w-3 inline mr-1" />
                    原名: {{ fileItem.originalFileName }}
                  </span>
                </div>
              </div>
            </td>
            <td class="text-sm text-base-content/70 text-center whitespace-nowrap">
              <span class="inline-flex items-center gap-1">
                <Icon icon="mdi:file" class="h-3.5 w-3.5 text-base-content/40" />
                {{ formatFileSize(fileItem.file.size) }}
              </span>
            </td>
            <td class="text-sm text-base-content/70 text-center whitespace-nowrap">
              <span class="badge badge-sm badge-ghost">{{ getFileTypeName(fileItem.file.type) }}</span>
            </td>
            <td class="text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1.5">
                <Icon
                  :icon="getStatusIcon(fileItem.status)"
                  :class="['h-4.5 w-4.5', getStatusClass(fileItem.status), getStatusIconClass(fileItem.status)]"
                />
                <span class="text-xs" :class="getStatusClass(fileItem.status)">{{ getStatusText(fileItem.status) }}</span>
              </div>
            </td>
            <td class="text-center whitespace-nowrap px-2">
              <div class="flex items-center justify-center gap-1">
                <button
                  v-if="fileItem.status !== 'success'"
                  class="btn btn-sm btn-primary"
                  @click="$emit('upload', fileItem.id)"
                  :disabled="disabled || fileItem.status === 'uploading'"
                  title="上传"
                >
                  <Icon icon="mdi:upload" class="h-4 w-4 mr-1" />
                  上传
                </button>
                <button
                  class="btn btn-sm btn-ghost text-error hover:bg-error/10"
                  @click="$emit('remove', fileItem.id)"
                  :disabled="disabled || fileItem.status === 'uploading'"
                  title="删除"
                >
                  <Icon icon="mdi:delete-outline" class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden space-y-3">
      <div
        v-for="fileItem in files"
        :key="fileItem.id"
        class="card bg-base-100 border border-base-300 overflow-hidden shadow-sm"
        :class="{ 'opacity-60': fileItem.status === 'uploading' }"
      >
        <div class="p-4">
          <div class="flex items-start gap-3">
            <div class="shrink-0 w-12 h-12 rounded-xl bg-base-200/70 flex items-center justify-center">
              <Icon :icon="getFileIcon(fileItem.file.type)" class="h-6 w-6 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-semibold wrap-break-word leading-tight" :title="fileItem.renamedFileName || fileItem.file.name">
                    {{ fileItem.renamedFileName || fileItem.file.name }}
                  </div>
                  <div v-if="fileItem.renamedFileName" class="text-xs text-base-content/50 wrap-break-word leading-tight mt-1" :title="fileItem.originalFileName">
                    <Icon icon="mdi:arrow-left-right" class="h-3 w-3 inline mr-1" />
                    原名: {{ fileItem.originalFileName }}
                  </div>
                </div>
                <Icon
                  :icon="getStatusIcon(fileItem.status)"
                  :class="['h-5 w-5 shrink-0 mt-0.5', getStatusClass(fileItem.status), getStatusIconClass(fileItem.status)]"
                />
              </div>

              <div class="flex items-center gap-2 mt-3">
                <span class="inline-flex items-center gap-1.5 bg-base-200/60 px-2.5 py-1 rounded-lg text-xs">
                  <Icon icon="mdi:file" class="h-3.5 w-3.5 text-base-content/50" />
                  {{ formatFileSize(fileItem.file.size) }}
                </span>
                <span class="inline-flex items-center gap-1.5 bg-base-200/60 px-2.5 py-1 rounded-lg text-xs">
                  <Icon icon="mdi:label" class="h-3.5 w-3.5 text-base-content/50" />
                  {{ getFileTypeName(fileItem.file.type) }}
                </span>
              </div>

              <div class="flex items-center gap-1 mt-3">
                <span class="inline-flex items-center gap-1 text-xs" :class="getStatusClass(fileItem.status)">
                  <Icon :icon="getStatusIcon(fileItem.status)" :class="['h-3.5 w-3.5', getStatusIconClass(fileItem.status)]" />
                  {{ getStatusText(fileItem.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 pb-4 pt-0">
          <div class="flex items-center gap-2">
            <button
              v-if="fileItem.status !== 'success'"
              class="btn btn-primary btn-sm flex-1 gap-1"
              @click="$emit('upload', fileItem.id)"
              :disabled="disabled || fileItem.status === 'uploading'"
            >
              <Icon icon="mdi:upload" class="h-4 w-4" />
              <span>上传</span>
            </button>
            <button
              class="btn btn-ghost btn-sm text-error hover:bg-error/10 flex-1 gap-1"
              @click="$emit('remove', fileItem.id)"
              :disabled="disabled || fileItem.status === 'uploading'"
            >
              <Icon icon="mdi:delete-outline" class="h-4 w-4" />
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
