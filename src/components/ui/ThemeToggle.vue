<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

const themeLabels: Record<'light' | 'dark' | 'system', string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
}

const themeIcons: Record<'light' | 'dark' | 'system', string> = {
  light: 'mdi:white-balance-sunny',
  dark: 'mdi:moon-waning-crescent',
  system: 'mdi:monitor',
}
</script>

<template>
  <button
    class="btn btn-ghost btn-sm gap-2"
    @click="appStore.cycleTheme"
    :title="`当前主题: ${themeLabels[appStore.theme]}`"
  >
    <Icon :icon="themeIcons[appStore.theme]" class="h-5 w-5" />
  </button>
</template>
