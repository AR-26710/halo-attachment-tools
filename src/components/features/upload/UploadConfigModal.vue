<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RenameConfigPanel, ConvertConfigPanel, CompressConfigPanel, QuickLinkConfigPanel, RenameHistoryConfigPanel } from '.'
import type { RenameMode } from '@/composables/file'

interface Props {
  show: boolean
  disabled?: boolean
  renameMode: RenameMode
  renameTemplate: string
  convertEnabled: boolean
  convertQuality: number
  convertMaxConcurrent: number
  compressEnabled: boolean
  compressQuality: number
  compressMaxWidth: number
  compressMaxHeight: number
  compressKeepOriginalFormat: boolean
  compressMaxConcurrent: number
  quickLinkEnabled: boolean
  renameHistoryEnabled: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:renameMode', value: RenameMode): void
  (e: 'update:renameTemplate', value: string): void
  (e: 'update:convertEnabled', value: boolean): void
  (e: 'update:convertQuality', value: number): void
  (e: 'update:convertMaxConcurrent', value: number): void
  (e: 'update:compressEnabled', value: boolean): void
  (e: 'update:compressQuality', value: number): void
  (e: 'update:compressMaxWidth', value: number): void
  (e: 'update:compressMaxHeight', value: number): void
  (e: 'update:compressKeepOriginalFormat', value: boolean): void
  (e: 'update:compressMaxConcurrent', value: number): void
  (e: 'update:quickLinkEnabled', value: boolean): void
  (e: 'update:renameHistoryEnabled', value: boolean): void
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box max-w-2xl max-h-[90vh] overflow-y-auto bg-base-100 border border-base-200 shadow-xl">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <Icon icon="mdi:cog-outline" class="h-5 w-5 text-primary" />
          上传配置
        </h3>
        <button
          type="button"
          class="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
          @click="handleClose"
        >
          <Icon icon="mdi:close" class="h-5 w-5" />
        </button>
      </div>

      <div class="space-y-4">
        <RenameConfigPanel
          :mode="renameMode"
          :template="renameTemplate"
          :disabled="disabled"
          @update:mode="emit('update:renameMode', $event)"
          @update:template="emit('update:renameTemplate', $event)"
        />

        <ConvertConfigPanel
          :enabled="convertEnabled"
          :quality="convertQuality"
          :max-concurrent="convertMaxConcurrent"
          :disabled="disabled"
          :compress-enabled="compressEnabled"
          @update:enabled="emit('update:convertEnabled', $event)"
          @update:quality="emit('update:convertQuality', $event)"
          @update:max-concurrent="emit('update:convertMaxConcurrent', $event)"
          @disable-compress="emit('update:compressEnabled', false)"
        />

        <CompressConfigPanel
          :enabled="compressEnabled"
          :quality="compressQuality"
          :max-width="compressMaxWidth"
          :max-height="compressMaxHeight"
          :keep-original-format="compressKeepOriginalFormat"
          :max-concurrent="compressMaxConcurrent"
          :disabled="disabled"
          :convert-enabled="convertEnabled"
          @update:enabled="emit('update:compressEnabled', $event)"
          @update:quality="emit('update:compressQuality', $event)"
          @update:max-width="emit('update:compressMaxWidth', $event)"
          @update:max-height="emit('update:compressMaxHeight', $event)"
          @update:keep-original-format="emit('update:compressKeepOriginalFormat', $event)"
          @update:max-concurrent="emit('update:compressMaxConcurrent', $event)"
          @disable-convert="emit('update:convertEnabled', false)"
        />

        <QuickLinkConfigPanel
          :enabled="quickLinkEnabled"
          :disabled="disabled"
          @update:enabled="emit('update:quickLinkEnabled', $event)"
        />

        <RenameHistoryConfigPanel
          :enabled="renameHistoryEnabled"
          :disabled="disabled"
          @update:enabled="emit('update:renameHistoryEnabled', $event)"
        />
      </div>

      <div class="modal-action mt-6">
        <button type="button" class="btn btn-primary" @click="handleClose">
          <Icon icon="mdi:check" class="h-4 w-4 mr-1" />
          完成
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>
