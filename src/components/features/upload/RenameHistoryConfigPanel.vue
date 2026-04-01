<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { BaseCard } from '@/components/ui'

interface Props {
  enabled: boolean
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:enabled', value: boolean): void
}>()

function handleEnabledChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:enabled', target.checked)
}
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between -mt-2 pt-6">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:history" class="h-5 w-5 text-primary" />
        <h3 class="card-title text-sm font-medium">重命名记录</h3>
      </div>
      <label class="flex items-center gap-3 cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
        <input
          type="checkbox"
          class="toggle toggle-primary"
          :checked="enabled"
          :disabled="disabled"
          @change="handleEnabledChange"
        />
      </label>
    </div>

    <div class="mt-4 text-xs text-base-content/60 space-y-1">
      <p>开启后，每次上传时会记录原始文件名与修改后的文件名映射关系</p>
      <p>记录以同一次上传的文件为单位进行存储，支持导出为 JSON 格式</p>
    </div>
  </BaseCard>
</template>
