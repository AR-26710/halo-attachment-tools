<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { BaseCard } from '@/components/ui'

interface Props {
  enabled: boolean
  disabled?: boolean
}

const props = defineProps<Props>()

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
        <Icon icon="mdi:content-copy" class="h-5 w-5 text-primary" />
        <h3 class="card-title text-sm font-medium">快捷链接</h3>
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
      <p>启用后，上传完成后会显示快捷链接面板，支持复制图片链接。</p>
      <p>支持 URL、Markdown、HTML、BBCode 等多种格式。</p>
    </div>
  </BaseCard>
</template>
