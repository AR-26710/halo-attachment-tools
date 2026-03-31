<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { version } from '../../package.json'
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <header class="bg-base-100 shadow-sm sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-3 md:px-4 py-4">
        <slot name="header" />
      </div>
    </header>

    <main class="flex-1 py-4 md:py-8">
      <div class="max-w-4xl mx-auto px-3 md:px-4">
        <slot />
      </div>
    </main>

    <footer class="bg-base-100 border-t border-base-300">
      <div class="max-w-4xl mx-auto px-3 md:px-4 py-4 flex items-center justify-between text-sm text-base-content/60">
        <slot name="footer">
          <p>&copy; {{ new Date().getFullYear() }} - Halo 附件工具 | v{{ version }}</p>
          <a
            href="https://github.com/AR-26710/halo-attachment-tools"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 hover:text-base-content transition-colors"
          >
            <Icon icon="mdi:github" class="h-[18px] w-[18px]" />
            <span>GitHub</span>
          </a>
        </slot>
      </div>
    </footer>
  </div>
</template>
