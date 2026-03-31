<script setup lang="ts">
interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
  label?: string
}

withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true,
})

const emit = defineEmits<(e: 'update:modelValue', value: number) => void>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number.parseFloat(target.value))
}
</script>

<template>
  <div class="form-control">
    <label v-if="label" class="label py-1">
      <span class="label-text text-sm font-medium">{{ label }}</span>
      <span v-if="showValue" class="badge badge-primary badge-sm">{{ Math.round(modelValue * 100) }}%</span>
    </label>
    <div class="relative pt-1">
      <input
        type="range"
        class="range range-sm range-primary w-full"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :disabled="disabled"
        @input="handleInput"
      />
    </div>
    <div class="flex justify-between text-xs text-base-content/50 mt-2 px-1">
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-success/60"></span>
        低质量
      </span>
      <span class="flex items-center gap-1">
        高质量
        <span class="w-2 h-2 rounded-full bg-primary/60"></span>
      </span>
    </div>
  </div>
</template>
