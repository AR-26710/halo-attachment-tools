<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  username: string
  password: string
}>()

const emit = defineEmits<{
  (e: 'update:username', value: string): void
  (e: 'update:password', value: string): void
}>()

const showPassword = ref(false)
const usernameTouched = ref(false)
const passwordTouched = ref(false)

const usernameError = computed(() => {
  if (!usernameTouched.value) return ''
  if (!props.username.trim()) return '用户名不能为空'
  return ''
})

const passwordError = computed(() => {
  if (!passwordTouched.value) return ''
  if (!props.password.trim()) return '密码不能为空'
  return ''
})

const isUsernameValid = computed(() => props.username.trim().length > 0)
const isPasswordValid = computed(() => props.password.trim().length > 0)
const isValid = computed(() => isUsernameValid.value && isPasswordValid.value)

watch(() => props.username, (newValue) => {
  if (newValue) usernameTouched.value = true
})

watch(() => props.password, (newValue) => {
  if (newValue) passwordTouched.value = true
})

function handleUsernameBlur() {
  usernameTouched.value = true
}

function handlePasswordBlur() {
  passwordTouched.value = true
}

function handleUsernameInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:username', value)
}

function handlePasswordInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:password', value)
}

defineExpose({
  isValid,
  usernameError,
  passwordError
})
</script>

<template>
  <div class="space-y-2 md:space-y-4">
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text font-medium text-sm md:text-base">用户名 *</span>
      </label>
      <input
        :value="username"
        type="text"
        placeholder="请输入用户名"
        :class="[
          'input input-bordered input-sm md:input-md w-full',
          usernameError ? 'input-error' : ''
        ]"
        @input="handleUsernameInput"
        @blur="handleUsernameBlur"
      />
      <label class="label" v-if="usernameError">
        <span class="label-text-alt text-error text-xs md:text-sm">{{ usernameError }}</span>
      </label>
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text font-medium text-sm md:text-base">密码 *</span>
      </label>
      <div class="relative">
        <input
          :value="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          :class="[
            'input input-bordered input-sm md:input-md w-full pr-10',
            passwordError ? 'input-error' : ''
          ]"
          @input="handlePasswordInput"
          @blur="handlePasswordBlur"
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
      <label class="label">
        <span
          :class="[
            'label-text-alt text-xs md:text-sm',
            passwordError ? 'text-error' : 'text-base-content/60'
          ]"
        >
          {{ passwordError || 'Basic Auth 需要在 Halo 配置中启用' }}
        </span>
      </label>
    </div>
  </div>
</template>
