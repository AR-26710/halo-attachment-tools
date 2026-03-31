<script setup lang="ts">
defineProps<{
  canSave: boolean
  testing: boolean
  hasExistingConfig: boolean
  showCancel?: boolean
}>()

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'test'): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="card-actions justify-end mt-4 md:mt-6 flex-wrap gap-2">
    <button
      v-if="hasExistingConfig"
      class="btn btn-outline btn-error btn-sm md:btn-md"
      @click="emit('clear')"
    >
      清除配置
    </button>
    <button
      class="btn btn-outline btn-sm md:btn-md"
      :disabled="!canSave || testing"
      @click="emit('test')"
    >
      <span v-if="testing" class="loading loading-spinner loading-sm"></span>
      测试连接
    </button>
    <button
      class="btn btn-primary btn-sm md:btn-md"
      :disabled="!canSave"
      @click="emit('save')"
    >
      保存配置
    </button>
    <button
      v-if="showCancel"
      class="btn btn-ghost btn-sm md:btn-md"
      @click="emit('cancel')"
    >
      关闭
    </button>
  </div>
</template>
