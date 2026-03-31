<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<(e: 'update:modelValue', value: string) => void>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isReadingFile = ref(false)
const showPassword = ref(false)
const touched = ref(false)

const error = computed(() => {
  if (!touched.value) return ''
  if (!props.modelValue.trim()) return '个人令牌不能为空'
  if (!props.modelValue.startsWith('pat_')) return '令牌格式不正确，应以 pat_ 开头'
  return ''
})

const isValid = computed(() => {
  const value = props.modelValue.trim()
  return value.length > 0 && value.startsWith('pat_')
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) touched.value = true
})

function handleBlur() {
  touched.value = true
}

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isReadingFile.value = true
  try {
    const content = await file.text()
    const token = content.trim()
    emit('update:modelValue', token)
    touched.value = true
  } catch (error) {
    console.error('读取文件失败:', error)
  } finally {
    isReadingFile.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

defineExpose({
  isValid,
  error
})
</script>

<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text font-medium text-sm md:text-base">个人令牌 *</span>
    </label>
    <div class="flex gap-2">
      <div class="relative flex-1">
        <input
          :value="modelValue"
          :type="showPassword ? 'text' : 'password'"
          placeholder="pat_xxxxxxxxxxxxxxxx"
          autocomplete="off"
          data-lpignore="true"
          data-form-type="other"
          :class="[
            'input input-bordered input-sm md:input-md w-full pr-10',
            error ? 'input-error' : ''
          ]"
          @input="handleInput"
          @blur="handleBlur"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
          @click="showPassword = !showPassword"
        >
          <Icon
            :icon="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
            class="h-4 w-4 md:h-5 md:w-5"
          />
        </button>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept=".txt,.pat,.token,*"
        class="hidden"
        @change="handleFileSelect"
      />
      <button
        type="button"
        class="btn btn-outline btn-sm md:btn-md whitespace-nowrap"
        :disabled="isReadingFile"
        @click="triggerFileInput"
      >
        <span v-if="isReadingFile" class="loading loading-spinner loading-sm"></span>
        <Icon v-else icon="mdi:file-upload-outline" class="h-4 w-4 md:h-5 md:w-5" />
        <span class="hidden sm:inline">从文件读取</span>
        <span class="sm:hidden">读取</span>
      </button>
    </div>
    <label class="label">
      <span
        :class="[
          'label-text-alt text-xs md:text-sm',
          error ? 'text-error' : 'text-base-content/60'
        ]"
      >
        {{ error || '在 Halo 个人中心 → 个人令牌 中创建，或从文件读取令牌' }}
      </span>
    </label>
  </div>
</template>
