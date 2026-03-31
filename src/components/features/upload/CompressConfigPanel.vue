<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, FormRange} from '@/components/ui'

interface Props {
  enabled: boolean
  quality: number
  maxWidth: number
  maxHeight: number
  keepOriginalFormat: boolean
  maxConcurrent: number
  disabled?: boolean
  convertEnabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:enabled', value: boolean): void
  (e: 'update:quality', value: number): void
  (e: 'update:maxWidth', value: number): void
  (e: 'update:maxHeight', value: number): void
  (e: 'update:keepOriginalFormat', value: boolean): void
  (e: 'update:maxConcurrent', value: number): void
}>()

const isExpanded = ref(false)

function expand() {
  isExpanded.value = true
}

function toggle() {
  isExpanded.value = !isExpanded.value
}

defineExpose({
  expand,
  toggle,
})

const isDisabled = computed(() => props.disabled || props.convertEnabled)

function handleEnabledChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:enabled', target.checked)
}

function handleQualityChange(value: number) {
  emit('update:quality', value)
}

function handleMaxWidthChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:maxWidth', Number.parseInt(target.value, 10))
}

function handleMaxHeightChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:maxHeight', Number.parseInt(target.value, 10))
}

function handleKeepOriginalFormatChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:keepOriginalFormat', target.checked)
}

function handleMaxConcurrentChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:maxConcurrent', Number.parseInt(target.value, 10))
}
</script>

<template>
  <BaseCard>
    <div
      class="flex items-center justify-between cursor-pointer select-none -mt-2 pt-6"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <Icon icon="mdi:folder-zip-outline" class="h-5 w-5 text-primary" />
        <h3 class="card-title text-sm font-medium">图片压缩</h3>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="!isExpanded && enabled"
          class="badge badge-primary badge-sm"
        >已启用</span>
        <Icon
          icon="mdi:chevron-down"
          class="h-5 w-5 text-base-content/50 transition-transform duration-200 will-change-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </div>

    <div
      class="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
      :class="isExpanded ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="flex flex-col gap-4 mt-4">
        <label class="flex items-center gap-3 cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': isDisabled }">
          <input
            type="checkbox"
            class="toggle toggle-primary"
            :checked="enabled"
            :disabled="isDisabled"
            @change="handleEnabledChange"
          />
          <span class="text-sm">启用图片压缩</span>
        </label>

        <div v-if="convertEnabled" class="alert alert-warning alert-sm gap-2">
          <Icon icon="mdi:alert-circle-outline" class="h-4 w-4 shrink-0" />
          <span class="text-xs">图片格式转换已启用，无法同时使用图片压缩功能</span>
        </div>

        <div
          class="overflow-hidden transition-[max-height,opacity] duration-200 ease-out"
          :class="enabled ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'"
        >
          <div class="space-y-4 pt-2 border-t border-base-300">
            <FormRange
              :model-value="quality"
              :min="0.1"
              :max="1"
              :step="0.05"
              :disabled="disabled"
              label="压缩质量"
              @update:model-value="handleQualityChange"
            />

            <div class="grid grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text text-xs font-medium">最大宽度 (px)</span>
                </label>
                <input
                  type="number"
                  class="input input-sm input-bordered w-full"
                  :value="maxWidth"
                  :disabled="disabled"
                  min="100"
                  max="8192"
                  step="10"
                  @input="handleMaxWidthChange"
                />
              </div>
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text text-xs font-medium">最大高度 (px)</span>
                </label>
                <input
                  type="number"
                  class="input input-sm input-bordered w-full"
                  :value="maxHeight"
                  :disabled="disabled"
                  min="100"
                  max="8192"
                  step="10"
                  @input="handleMaxHeightChange"
                />
              </div>
            </div>

            <label class="flex items-center gap-3 cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
              <input
                type="checkbox"
                class="toggle toggle-primary toggle-sm"
                :checked="keepOriginalFormat"
                :disabled="disabled"
                @change="handleKeepOriginalFormatChange"
              />
              <span class="text-sm">保持原格式</span>
            </label>

            <div class="form-control">
              <label class="label py-1">
                <span class="label-text text-xs font-medium">并发数量</span>
              </label>
              <input
                type="number"
                class="input input-sm input-bordered w-full"
                :value="maxConcurrent"
                :disabled="disabled"
                min="1"
                max="10"
                step="1"
                @input="handleMaxConcurrentChange"
              />
              <label class="label py-1">
                <span class="label-text-alt text-xs text-base-content/60">同时处理的图片数量 (1-10)</span>
              </label>
            </div>

            <div class="alert alert-info gap-2">
              <Icon icon="mdi:lightbulb-outline" class="h-4 w-4 shrink-0" />
              <span class="text-xs">
                压缩后图片尺寸将不超过 {{ maxWidth }}×{{ maxHeight }}，
                {{ keepOriginalFormat ? '保持原有格式' : '转换为 JPEG 格式' }}，
                并发处理 {{ maxConcurrent }} 张图片
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
