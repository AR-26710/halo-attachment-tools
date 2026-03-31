<script setup lang="ts">
interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string
  options: RadioOption[]
  name: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'sm',
})

const emit = defineEmits<(e: 'update:modelValue', value: string) => void>()

function handleChange(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <label
      v-for="option in options"
      :key="option.value"
      class="label cursor-pointer gap-2"
      :class="{ 'opacity-50': option.disabled || disabled }"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="option.disabled || disabled"
        class="radio radio-primary"
        :class="size === 'sm' ? 'radio-sm' : ''"
        @change="handleChange(option.value)"
      />
      <span class="label-text" :class="size === 'sm' ? 'text-sm' : ''">
        {{ option.label }}
      </span>
    </label>
  </div>
</template>
