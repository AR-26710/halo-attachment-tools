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

function isValidHostname(hostname: string): boolean {
  if (isValidIPv4(hostname)) return true
  if (isValidIPv6(hostname)) return true
  if (hostname.includes('.') && !hostname.startsWith('.') && !hostname.endsWith('.')) {
    return true
  }
  if (hostname === 'localhost') return true
  return false
}

function parseUrl(url: string): { protocol: 'http://' | 'https://'; hostname: string } {
  let protocol: 'http://' | 'https://' = 'https://'
  let hostname = url.trim()
  
  if (hostname.startsWith('http://')) {
    protocol = 'http://'
    hostname = hostname.slice(7)
  } else if (hostname.startsWith('https://')) {
    protocol = 'https://'
    hostname = hostname.slice(8)
  }
  
  return { protocol, hostname }
}

function isValidUrl(url: string): boolean {
  if (!url.trim()) return false
  
  const { protocol, hostname } = parseUrl(url)
  
  try {
    const urlObj = new URL(protocol + hostname)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false
    }
    return isValidHostname(urlObj.hostname)
  } catch {
    return false
  }
}

const error = computed(() => {
  if (!touched.value) return ''
  if (!props.modelValue.trim()) return '站点地址不能为空'
  if (!isValidUrl(props.modelValue)) return '请输入有效的域名或 IP 地址'
  return ''
})

const isValid = computed(() => isValidUrl(props.modelValue))

const currentProtocol = computed(() => parseUrl(props.modelValue).protocol)
const currentHostname = computed(() => parseUrl(props.modelValue).hostname)

watch(() => props.modelValue, () => {
  if (props.modelValue) {
    touched.value = true
  }
})

function toggleProtocol() {
  const { protocol, hostname } = parseUrl(props.modelValue)
  const newProtocol = protocol === 'https://' ? 'http://' : 'https://'
  emit('update:modelValue', newProtocol + hostname)
}

function handleInput(value: string) {
  const { protocol } = parseUrl(props.modelValue)
  const newHostname = value.trim()
  
  if (newHostname.startsWith('http://') || newHostname.startsWith('https://')) {
    const parsed = parseUrl(newHostname)
    emit('update:modelValue', parsed.protocol + parsed.hostname)
  } else {
    emit('update:modelValue', protocol + newHostname)
  }
}

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
    <div class="join w-full">
      <button
        class="btn join-item border-r-0 input-sm md:btn-md"
        type="button"
        @click="toggleProtocol"
      >
        {{ currentProtocol }}
      </button>
      <input
        :value="currentHostname"
        type="text"
        placeholder="your-halo-site.com 或 192.168.1.1"
        autocomplete="url"
        :class="[
          'input join-item input-bordered input-sm md:input-md w-full',
          error ? 'input-error' : ''
        ]"
        @input="handleInput(($event.target as HTMLInputElement).value)"
        @blur="handleBlur"
      />
    </div>
    <label class="label">
      <span
        :class="[
          'label-text-alt text-xs md:text-sm',
          error ? 'text-error' : 'text-base-content/60'
        ]"
      >
        {{ error || '输入 Halo 站点的域名或 IP 地址，点击左侧按钮切换协议' }}
      </span>
    </label>
  </div>
</template>
