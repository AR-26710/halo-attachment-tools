<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<(e: 'update:modelValue', value: string) => void>()

const touched = ref(false)

function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

function isValidIPv6(ip: string): boolean {
  const ipv6Regex = /^(?:(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6}|:(?::[a-fA-F0-9]{1,4}){1,7}|::(?:[fF]{4}:)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[a-fA-F0-9]{1,4}:){1,4}:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/
  return ipv6Regex.test(ip)
}

function isValidUrl(url: string): boolean {
  if (!url.trim()) return false
  try {
    const urlObj = new URL(url)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false
    }
    const hostname = urlObj.hostname
    if (isValidIPv4(hostname)) return true
    if (isValidIPv6(hostname)) return true
    if (hostname.includes('.') && !hostname.startsWith('.') && !hostname.endsWith('.')) {
      return true
    }
    if (hostname === 'localhost') return true
    return false
  } catch {
    return false
  }
}

const error = computed(() => {
  if (!touched.value) return ''
  if (!props.modelValue.trim()) return '站点地址不能为空'
  if (!isValidUrl(props.modelValue)) return '请输入有效的 URL 地址（以 http:// 或 https:// 开头）'
  return ''
})

const isValid = computed(() => isValidUrl(props.modelValue))

watch(() => props.modelValue, () => {
  if (props.modelValue) {
    touched.value = true
  }
})

function handleBlur() {
  touched.value = true
}

defineExpose({
  isValid,
  error
})
</script>

<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text font-medium text-sm md:text-base">站点地址 *</span>
    </label>
    <input
      :value="modelValue"
      type="url"
      placeholder="https://your-halo-site.com"
      autocomplete="url"
      :class="[
        'input input-bordered input-sm md:input-md w-full',
        error ? 'input-error' : ''
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="handleBlur"
    />
    <label class="label">
      <span
        :class="[
          'label-text-alt text-xs md:text-sm',
          error ? 'text-error' : 'text-base-content/60'
        ]"
      >
        {{ error || 'Halo 站点的完整 URL' }}
      </span>
    </label>
  </div>
</template>
