<script setup lang="ts">
type AuthType = 'pat' | 'basic'

defineProps<{
  modelValue: AuthType
}>()

const emit = defineEmits<(e: 'update:modelValue', value: AuthType) => void>()

const options: { value: AuthType; label: string }[] = [
  { value: 'pat', label: '个人令牌' },
  { value: 'basic', label: 'Basic Auth' }
]
</script>

<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text font-medium text-sm md:text-base">认证方式 *</span>
    </label>
    <div class="flex gap-4 flex-wrap">
      <label
        v-for="option in options"
        :key="option.value"
        class="label cursor-pointer gap-2"
      >
        <input
          type="radio"
          name="authType"
          :checked="modelValue === option.value"
          class="radio radio-primary radio-sm"
          @change="emit('update:modelValue', option.value)"
        />
        <span class="label-text text-sm md:text-base">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>
