<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard } from '@/components/ui'
import type { FileItem } from '@/composables/upload'

interface Props {
  files: FileItem[]
  siteUrl?: string
}

const props = defineProps<Props>()

type LinkFormat = 'url' | 'markdown' | 'html' | 'bbcode'

interface FormatOption {
  value: LinkFormat
  label: string
  icon: string
}

const formatOptions: FormatOption[] = [
  { value: 'url', label: 'URL', icon: 'mdi:link' },
  { value: 'markdown', label: 'Markdown', icon: 'mdi:markdown' },
  { value: 'html', label: 'HTML', icon: 'mdi:code-tags' },
  { value: 'bbcode', label: 'BBCode', icon: 'mdi:forum-outline' },
]

const selectedFormat = ref<LinkFormat>('url')
const copiedId = ref<string | null>(null)
const isExpanded = ref(false)

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

const uploadedFiles = computed(() => {
  return props.files.filter(f =>
    f.status === 'success' &&
    f.attachment?.status?.permalink &&
    isImageFile(f.file)
  )
})

const hasUploadedFiles = computed(() => uploadedFiles.value.length > 0)

const baseUrl = computed(() => {
  if (!props.siteUrl) return ''
  return props.siteUrl.replace(/\/$/, '')
})

function generateLink(file: FileItem, format: LinkFormat): string {
  const permalink = file.attachment?.status?.permalink || ''
  const url = permalink.startsWith('http') ? permalink : `${baseUrl.value}${permalink}`
  const name = file.file.name

  switch (format) {
    case 'url':
      return url
    case 'markdown':
      return `![${name}](${url})`
    case 'html':
      return `<img src="${url}" alt="${name}" />`
    case 'bbcode':
      return `[img]${url}[/img]`
    default:
      return url
  }
}

async function copyLink(file: FileItem, format: LinkFormat) {
  const link = generateLink(file, format)
  try {
    await navigator.clipboard.writeText(link)
    copiedId.value = `${file.id}-${format}`
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

function copyAllLinks(format: LinkFormat) {
  const links = uploadedFiles.value.map(f => generateLink(f, format)).join('\n')
  navigator.clipboard.writeText(links)
  copiedId.value = `all-${format}`
  setTimeout(() => {
    copiedId.value = null
  }, 2000)
}
</script>

<template>
  <BaseCard v-if="hasUploadedFiles">
    <div
      class="flex items-center justify-between cursor-pointer select-none -mt-2 pt-6"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <Icon icon="mdi:content-copy" class="h-5 w-5 text-primary" />
        <h3 class="card-title text-sm font-medium">快捷链接</h3>
        <span class="badge badge-sm badge-primary">{{ uploadedFiles.length }}</span>
      </div>
      <Icon
        icon="mdi:chevron-down"
        class="h-5 w-5 text-base-content/50 transition-transform duration-200 will-change-transform"
        :class="{ 'rotate-180': isExpanded }"
      />
    </div>

    <div
      class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
      :class="isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="space-y-4 mt-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in formatOptions"
          :key="option.value"
          class="btn btn-sm"
          :class="selectedFormat === option.value ? 'btn-primary' : 'btn-ghost btn-outline'"
          @click="selectedFormat = option.value"
        >
          <Icon :icon="option.icon" class="h-4 w-4 mr-1" />
          {{ option.label }}
        </button>
      </div>

      <div class="space-y-2 max-h-[300px] overflow-y-auto">
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="flex items-center gap-2 p-2 bg-base-200/50 rounded-lg"
        >
          <div class="flex-1 min-w-0">
            <div class="text-xs text-base-content/60 truncate mb-1">
              {{ file.file.name }}
            </div>
            <code class="text-xs bg-base-300 px-2 py-1 rounded block truncate">
              {{ generateLink(file, selectedFormat) }}
            </code>
          </div>
          <button
            class="btn btn-ghost btn-xs shrink-0"
            :class="copiedId === `${file.id}-${selectedFormat}` ? 'btn-success' : ''"
            @click="copyLink(file, selectedFormat)"
          >
            <Icon
              :icon="copiedId === `${file.id}-${selectedFormat}` ? 'mdi:check' : 'mdi:content-copy'"
              class="h-4 w-4"
            />
          </button>
        </div>
      </div>

      <div v-if="uploadedFiles.length > 1" class="pt-2 border-t border-base-200">
        <button
          class="btn btn-sm btn-outline btn-primary w-full"
          :class="copiedId === `all-${selectedFormat}` ? 'btn-success' : ''"
          @click="copyAllLinks(selectedFormat)"
        >
          <Icon
            :icon="copiedId === `all-${selectedFormat}` ? 'mdi:check' : 'mdi:content-copy'"
            class="h-4 w-4 mr-1"
          />
          {{ copiedId === `all-${selectedFormat}` ? '已复制全部' : '复制全部' }}
        </button>
      </div>
      </div>
    </div>
  </BaseCard>
</template>
