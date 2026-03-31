<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ThemeToggle from './ThemeToggle.vue'

defineProps<{
  title: string
  subtitle?: string
}>()

const emit = defineEmits<(e: 'openConfig') => void>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl md:text-2xl font-bold">{{ title }}</h1>
      <p v-if="subtitle" class="text-base-content/60 text-sm">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="btn btn-ghost btn-sm gap-1.5"
        title="上传配置"
        @click="emit('openConfig')"
      >
        <Icon icon="mdi:cog-outline" class="h-4 w-4" />
        <span class="hidden sm:inline text-xs">配置</span>
      </button>
      <div class="divider divider-horizontal mx-0"></div>
      <ThemeToggle />
      <slot name="actions" />
    </div>
  </div>
</template>
