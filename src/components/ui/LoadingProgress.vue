<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

interface Props {
  progress: number
  status?: 'uploading' | 'converting' | 'compressing' | 'processing'
  fileName?: string
  fileCount?: { current: number; total: number }
  sizeInfo?: { uploaded: string; total: string }
  estimatedTime?: string
}

const props = withDefaults(defineProps<Props>(), {
  status: 'uploading',
})

const statusConfig = computed(() => {
  switch (props.status) {
    case 'converting':
      return {
        icon: 'mdi:swap-horizontal',
        text: '格式转换中',
        color: 'warning',
      }
    case 'compressing':
      return {
        icon: 'mdi:zip-box',
        text: '压缩处理中',
        color: 'info',
      }
    case 'processing':
      return {
        icon: 'mdi:cog',
        text: '处理中',
        color: 'secondary',
      }
    default:
      return {
        icon: 'mdi:cloud-upload',
        text: '上传中',
        color: 'primary',
      }
  }
})

const progressPercent = computed(() => Math.min(100, Math.max(0, props.progress)))
</script>

<template>
  <div class="card bg-base-100 border border-base-300 shadow-sm">
    <div class="card-body p-4">
      <div class="flex items-center gap-3 mb-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center"
          :class="`bg-${statusConfig.color}/10`"
        >
          <Icon
            :icon="statusConfig.icon"
            class="h-5 w-5"
            :class="`text-${statusConfig.color}`"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm">{{ statusConfig.text }}</span>
            <span class="text-2xl font-bold" :class="`text-${statusConfig.color}`">
              {{ progressPercent }}%
            </span>
          </div>
          <p v-if="fileName" class="text-xs text-base-content/60 truncate">
            {{ fileName }}
          </p>
        </div>
        <div v-if="fileCount" class="text-right">
          <span class="text-sm font-medium">{{ fileCount.current }}</span>
          <span class="text-xs text-base-content/50">/{{ fileCount.total }}</span>
        </div>
      </div>

      <div class="relative">
        <progress
          class="progress w-full"
          :class="`progress-${statusConfig.color}`"
          :value="progressPercent"
          max="100"
        />
        <div
          v-if="progressPercent < 100"
          class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"
        />
      </div>

      <div class="flex justify-between items-center mt-2 text-xs text-base-content/50">
        <div class="flex items-center gap-2">
          <span v-if="sizeInfo" class="inline-flex items-center gap-1">
            <Icon icon="mdi:harddisk" class="h-3 w-3" />
            {{ sizeInfo.uploaded }} / {{ sizeInfo.total }}
          </span>
        </div>
        <span v-if="estimatedTime" class="inline-flex items-center gap-1">
          <Icon icon="mdi:clock-outline" class="h-3 w-3" />
          预计剩余 {{ estimatedTime }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
