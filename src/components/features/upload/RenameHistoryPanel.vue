<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard } from '@/components/ui'
import type { RenameHistoryEntry } from '@/composables/file'

interface Props {
  history: RenameHistoryEntry[]
  enabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'download'): void
  (e: 'clear'): void
  (e: 'remove', id: string): void
}>()

const isExpanded = ref(false)
const showDetailId = ref<string | null>(null)

const hasHistory = computed(() => props.history.length > 0)

const totalRecords = computed(() => {
  return props.history.reduce((sum, entry) => sum + entry.records.length, 0)
})

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function toggleDetail(id: string) {
  showDetailId.value = showDetailId.value === id ? null : id
}

function handleDownload() {
  emit('download')
}

function handleClear() {
  emit('clear')
}

function handleRemove(id: string) {
  emit('remove', id)
}
</script>

<template>
  <BaseCard v-if="enabled && hasHistory">
    <div
      class="flex items-center justify-between cursor-pointer select-none -mt-2 pt-6"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <Icon icon="mdi:history" class="h-5 w-5 text-primary" />
        <h3 class="card-title text-sm font-medium">重命名记录</h3>
        <span class="badge badge-sm badge-primary">{{ history.length }}</span>
        <span class="badge badge-sm badge-ghost">{{ totalRecords }} 个文件</span>
      </div>
      <Icon
        icon="mdi:chevron-down"
        class="h-5 w-5 text-base-content/50 transition-transform duration-200 will-change-transform"
        :class="{ 'rotate-180': isExpanded }"
      />
    </div>

    <div
      class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
      :class="isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="space-y-4 mt-4">
        <div class="flex gap-2">
          <button
            class="btn btn-sm btn-outline btn-primary flex-1"
            @click="handleDownload"
          >
            <Icon icon="mdi:download" class="h-4 w-4 mr-1" />
            导出 JSON
          </button>
          <button
            class="btn btn-sm btn-outline btn-error"
            @click="handleClear"
          >
            <Icon icon="mdi:delete-sweep" class="h-4 w-4 mr-1" />
            清空
          </button>
        </div>

        <div class="space-y-2 max-h-[400px] overflow-y-auto">
          <div
            v-for="entry in history"
            :key="entry.id"
            class="bg-base-200/50 rounded-lg overflow-hidden"
          >
            <div
              class="flex items-center justify-between p-3 cursor-pointer hover:bg-base-200 transition-colors"
              @click="toggleDetail(entry.id)"
            >
              <div class="flex items-center gap-2 min-w-0">
                <Icon
                  icon="mdi:chevron-right"
                  class="h-4 w-4 text-base-content/50 transition-transform duration-200"
                  :class="{ 'rotate-90': showDetailId === entry.id }"
                />
                <span class="text-sm font-medium truncate">
                  {{ formatTime(entry.timestamp) }}
                </span>
                <span class="badge badge-sm badge-ghost shrink-0">
                  {{ entry.records.length }} 个文件
                </span>
              </div>
              <button
                class="btn btn-ghost btn-xs shrink-0"
                @click.stop="handleRemove(entry.id)"
              >
                <Icon icon="mdi:close" class="h-4 w-4" />
              </button>
            </div>

            <div
              v-show="showDetailId === entry.id"
              class="border-t border-base-300/50"
            >
              <div class="p-3 space-y-2">
                <div
                  v-for="(record, index) in entry.records"
                  :key="index"
                  class="text-sm space-y-1"
                >
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-base-content/60 truncate flex-1" :title="record.originalName">
                      {{ record.originalName }}
                    </span>
                    <Icon icon="mdi:arrow-right" class="h-3 w-3 text-primary shrink-0" />
                    <span class="text-primary truncate flex-1" :title="record.newName">
                      {{ record.newName }}
                    </span>
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
