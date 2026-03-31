<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface TestResult {
  success: boolean
  message: string
}

defineProps<{
  result: TestResult | null
}>()
</script>

<template>
  <div v-if="result" class="mt-3 md:mt-4">
    <div
      :class="[
        'alert text-sm',
        result.success ? 'alert-success' : 'alert-error'
      ]"
    >
      <Icon
        v-if="result.success"
        icon="mdi:check-circle-outline"
        class="h-4 w-4 md:h-5 md:w-5"
      />
      <Icon
        v-else
        icon="mdi:alert-circle-outline"
        class="h-4 w-4 md:h-5 md:w-5"
      />
      <span>{{ result.message }}</span>
    </div>
  </div>
</template>
