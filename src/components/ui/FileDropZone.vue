<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  isDragging: boolean
  disabled?: boolean
  fileCount?: number
  maxFiles?: number
}>()

const emit = defineEmits<{
  (e: 'drop', event: DragEvent): void
  (e: 'dragover', event: DragEvent): void
  (e: 'dragleave'): void
  (e: 'fileSelect', event: Event): void
}>()

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  emit('dragover', event)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  emit('drop', event)
}
</script>

<template>
  <div
    class="group relative border-2 border-dashed rounded-xl p-8 md:p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden"
    :class="[
      isDragging 
        ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/20' 
        : 'border-base-content/30 hover:border-primary/60 hover:bg-base-200/30',
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
    ]"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="$emit('dragleave')"
  >
    <div
      class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300"
      :class="{ 'opacity-100': isDragging }"
    />

    <div class="relative z-10">
      <div
        class="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-base-200/80 mb-4 transition-all duration-300"
        :class="{ 'bg-primary/10 scale-110': isDragging }"
      >
        <Icon
          icon="mdi:cloud-upload-outline"
          class="h-8 w-8 md:h-10 md:w-10 transition-all duration-300"
          :class="[
            isDragging ? 'text-primary scale-110' : 'text-base-content/50 group-hover:text-primary/70'
          ]"
        />
      </div>

      <h3 class="text-base md:text-lg font-medium mb-1 transition-colors duration-200" :class="{ 'text-primary': isDragging }">
        拖拽文件到此处上传
      </h3>
      <p class="text-base-content/50 mb-4 text-sm">或点击下方按钮选择文件</p>

      <div class="flex justify-center">
        <label
          class="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          :class="{ 'pointer-events-none': disabled }"
        >
          <Icon icon="mdi:folder-open-outline" class="h-4 w-4 md:h-5 md:w-5" />
          <span>选择文件</span>
          <input
            type="file"
            multiple
            class="hidden"
            @change="$emit('fileSelect', $event)"
            :disabled="disabled"
          />
        </label>
      </div>

      <p class="text-xs text-base-content/40 mt-4">
        支持多文件上传<span v-if="maxFiles">（最多 {{ maxFiles }} 个）</span>
      </p>
      <p v-if="fileCount !== undefined && maxFiles" class="text-xs mt-2" :class="fileCount >= maxFiles ? 'text-error' : 'text-base-content/50'">
        已选择 {{ fileCount }}/{{ maxFiles }} 个文件
      </p>
    </div>
  </div>
</template>
