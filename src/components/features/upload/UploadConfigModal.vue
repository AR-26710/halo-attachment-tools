<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RenameConfigPanel, ConvertConfigPanel, CompressConfigPanel, QuickLinkConfigPanel, RenameHistoryConfigPanel } from '.'
import type { RenameMode } from '@/composables/file'
import { ref, useTemplateRef, watch, nextTick } from 'vue'

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

const props = defineProps<Props>()

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

const activeTab = ref('rename')

const renamePanelRef = useTemplateRef('renamePanel')
const convertPanelRef = useTemplateRef('convertPanel')
const compressPanelRef = useTemplateRef('compressPanel')

async function expandCurrentPanel() {
  await nextTick()
  if (activeTab.value === 'rename') {
    renamePanelRef.value?.expand()
  } else if (activeTab.value === 'convert') {
    convertPanelRef.value?.expand()
  } else if (activeTab.value === 'compress') {
    compressPanelRef.value?.expand()
  }
}

watch(() => props.show, (show) => {
  if (show) {
    expandCurrentPanel()
  }
})

watch(activeTab, () => {
  expandCurrentPanel()
})

function handleClose() {
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-base-100 border border-base-200 shadow-xl p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <h3 class="text-base sm:text-lg font-bold flex items-center gap-2">
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

      <!-- 移动端：下拉选择 -->
      <div class="sm:hidden mb-4">
        <select
          v-model="activeTab"
          class="select select-bordered select-sm w-full"
        >
          <option value="rename">重命名</option>
          <option value="convert">格式转换</option>
          <option value="compress">图片压缩</option>
          <option value="quicklink">快捷链接</option>
          <option value="history">历史记录</option>
        </select>
      </div>

      <!-- 桌面端：Tab 标签 -->
      <div class="hidden sm:flex tabs tabs-border mb-4 sm:mb-6 flex-wrap">
        <button
          type="button"
          class="tab tab-sm"
          :class="{ 'tab-active': activeTab === 'rename' }"
          @click="activeTab = 'rename'"
        >
          <Icon icon="mdi:rename-box" class="h-4 w-4 mr-1" />
          重命名
        </button>
        <button
          type="button"
          class="tab tab-sm"
          :class="{ 'tab-active': activeTab === 'convert' }"
          @click="activeTab = 'convert'"
        >
          <Icon icon="mdi:file-swap-outline" class="h-4 w-4 mr-1" />
          格式转换
        </button>
        <button
          type="button"
          class="tab tab-sm"
          :class="{ 'tab-active': activeTab === 'compress' }"
          @click="activeTab = 'compress'"
        >
          <Icon icon="mdi:image-compress" class="h-4 w-4 mr-1" />
          图片压缩
        </button>
        <button
          type="button"
          class="tab tab-sm"
          :class="{ 'tab-active': activeTab === 'quicklink' }"
          @click="activeTab = 'quicklink'"
        >
          <Icon icon="mdi:link-variant" class="h-4 w-4 mr-1" />
          快捷链接
        </button>
        <button
          type="button"
          class="tab tab-sm"
          :class="{ 'tab-active': activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          <Icon icon="mdi:history" class="h-4 w-4 mr-1" />
          历史记录
        </button>
      </div>

      <div class="panel-content">
        <RenameConfigPanel
          v-if="activeTab === 'rename'"
          ref="renamePanel"
          :mode="renameMode"
          :template="renameTemplate"
          :disabled="disabled"
          @update:mode="emit('update:renameMode', $event)"
          @update:template="emit('update:renameTemplate', $event)"
        />

        <ConvertConfigPanel
          v-if="activeTab === 'convert'"
          ref="convertPanel"
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
          v-if="activeTab === 'compress'"
          ref="compressPanel"
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
          v-if="activeTab === 'quicklink'"
          :enabled="quickLinkEnabled"
          :disabled="disabled"
          @update:enabled="emit('update:quickLinkEnabled', $event)"
        />

        <RenameHistoryConfigPanel
          v-if="activeTab === 'history'"
          :enabled="renameHistoryEnabled"
          :disabled="disabled"
          @update:enabled="emit('update:renameHistoryEnabled', $event)"
        />
      </div>

      <div class="modal-action mt-4 sm:mt-6">
        <button type="button" class="btn btn-primary btn-sm sm:btn-md" @click="handleClose">
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
