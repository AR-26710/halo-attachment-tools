<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, FormRadioGroup} from '@/components/ui'

import type { RenameMode } from '@/composables/file'

interface Props {
  mode: RenameMode
  template: string
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:mode', value: RenameMode): void
  (e: 'update:template', value: string): void
}>()

const isExpanded = ref(false)

function expand() {
  isExpanded.value = true
}

function toggle() {
  isExpanded.value = !isExpanded.value
}

defineExpose({
  expand,
  toggle,
})
const copiedCode = ref<string | null>(null)

async function copyToClipboard(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    copiedCode.value = code
    setTimeout(() => {
      copiedCode.value = null
    }, 1500)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const modeOptions = [
  { value: 'origin', label: '保持原名' },
  { value: 'custom', label: '自定义重命名' },
]

const isCustomMode = computed(() => props.mode === 'custom')

const placeholderGroups = [
  {
    title: '基础信息',
    items: [
      { code: '${origin-filename}', desc: '原文件名' },
      { code: '${uuid-with-dash}', desc: '带 - 的 UUID' },
      { code: '${uuid-no-dash}', desc: '不带 - 的 UUID' },
    ],
  },
  {
    title: '时间戳',
    items: [
      { code: '${timestamp-sec}', desc: '秒时间戳 (10位)' },
      { code: '${timestamp-ms}', desc: '毫秒时间戳 (13位)' },
    ],
  },
  {
    title: '日期时间',
    items: [
      { code: '${year}', desc: '年份' },
      { code: '${month}', desc: '月份 (两位数)' },
      { code: '${day}', desc: '日期 (两位数)' },
      { code: '${weekday}', desc: '星期几 (1-7)' },
      { code: '${hour}', desc: '小时 (24小时制)' },
      { code: '${minute}', desc: '分钟 (两位数)' },
      { code: '${second}', desc: '秒 (两位数)' },
      { code: '${millisecond}', desc: '毫秒 (三位数)' },
    ],
  },
  {
    title: '随机字符',
    items: [
      { code: '${random-alphabetic:X}', desc: '随机小写字母，X为长度' },
      { code: '${random-num:X}', desc: '随机数字，X为长度' },
      { code: '${random-alphanumeric:X}', desc: '随机字母数字，X为长度' },
    ],
  },
] as const

function handleModeChange(value: string) {
  emit('update:mode', value as RenameMode)
}

function handleTemplateInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:template', target.value)
}
</script>

<template>
  <BaseCard>
    <div
      class="flex items-center justify-between cursor-pointer select-none -mt-2 pt-6"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <Icon icon="mdi:rename-outline" class="h-5 w-5 text-primary" />
        <h3 class="card-title text-sm font-medium">文件重命名</h3>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="!isExpanded && isCustomMode"
          class="badge badge-primary badge-sm"
        >已启用</span>
        <Icon
          icon="mdi:chevron-down"
          class="h-5 w-5 text-base-content/50 transition-transform duration-200 will-change-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </div>

    <div
      class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
      :class="isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="flex flex-col gap-4 mt-4">
      <FormRadioGroup
        :model-value="mode"
        :options="modeOptions"
        name="renameMode"
        :disabled="disabled"
        @update:model-value="handleModeChange"
      />

      <div
        class="overflow-hidden transition-[max-height,opacity] duration-200 ease-out space-y-4"
        :class="isCustomMode ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'"
      >
          <label class="label py-1">
            <span class="label-text text-xs font-medium">文件名模板</span>
          </label>
          <div class="relative">
            <input
              type="text"
              class="input input-sm input-bordered w-full pr-8 font-mono text-sm"
              :value="template"
              :disabled="disabled"
              placeholder="${origin-filename}-${uuid-no-dash}"
              @input="handleTemplateInput"
            />
            <Icon
              icon="mdi:code-braces"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40"
            />
          </div>

          <slot name="preview" />

          <div class="collapse collapse-arrow bg-base-200 rounded-lg border border-base-300">
            <input type="checkbox" class="peer" />
            <div class="collapse-title text-xs font-medium py-2.5 flex items-center gap-2">
              <Icon icon="mdi:information-outline" class="h-4 w-4 text-primary" />
              支持的占位符
            </div>
            <div class="collapse-content text-xs">
              <div class="space-y-3 pb-2">
                <div
                  v-for="group in placeholderGroups"
                  :key="group.title"
                  class="border-b border-base-300/50 last:border-0 pb-3 last:pb-0"
                >
                  <h4 class="font-medium text-base-content/70 mb-2 flex items-center gap-1">
                    <Icon icon="mdi:chevron-right" class="h-3 w-3" />
                    {{ group.title }}
                  </h4>
                  <div class="grid grid-cols-2 gap-1.5">
                    <div
                      v-for="item in group.items"
                      :key="item.code"
                      class="group flex items-center gap-2 hover:bg-base-300 rounded px-1.5 py-0.5 transition-colors cursor-pointer"
                      @click="copyToClipboard(item.code)"
                      :title="'点击复制 ' + item.code"
                    >
                      <code
                        class="px-1.5 py-0.5 rounded text-[11px] font-mono shrink-0 transition-colors"
                        :class="copiedCode === item.code ? 'bg-success/20 text-success' : 'bg-base-300 text-primary'"
                      >
                        {{ copiedCode === item.code ? '已复制!' : item.code }}
                      </code>
                      <span class="text-base-content/60 truncate">{{ item.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      </div>
    </div>
  </BaseCard>
</template>
