<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info'
  retryable?: boolean
  retryLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: '出错了',
  type: 'error',
  retryable: false,
  retryLabel: '重试',
})

defineEmits<{
  (e: 'retry'): void
  (e: 'close'): void
}>()

const typeConfig = {
  error: {
    icon: 'mdi:alert-circle-outline',
    alertClass: 'alert-error',
    iconBg: 'bg-error/10',
    iconColor: 'text-error',
  },
  warning: {
    icon: 'mdi:alert-outline',
    alertClass: 'alert-warning',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  info: {
    icon: 'mdi:information-outline',
    alertClass: 'alert-info',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
  },
}
</script>

<template>
  <div class="alert" :class="typeConfig[type].alertClass">
    <div class="flex items-start gap-3 w-full">
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        :class="typeConfig[type].iconBg"
      >
        <Icon
          :icon="typeConfig[type].icon"
          class="h-4 w-4"
          :class="typeConfig[type].iconColor"
        />
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-sm">{{ title }}</h4>
        <p class="text-sm opacity-80 mt-1">{{ message }}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          v-if="retryable"
          class="btn btn-sm btn-ghost gap-1"
          @click="$emit('retry')"
        >
          <Icon icon="mdi:refresh" class="h-4 w-4" />
          {{ retryLabel }}
        </button>
        <button
          class="btn btn-ghost btn-sm btn-square"
          @click="$emit('close')"
        >
          <Icon icon="mdi:close" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
