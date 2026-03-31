import { ref, computed } from 'vue'
import type { AuthConfig } from '@/types'

type AuthType = 'pat' | 'basic'

export function useAuthForm(initialConfig?: AuthConfig | null) {
  const authType = ref<AuthType>(initialConfig?.type ?? 'pat')
  const siteUrl = ref(initialConfig?.siteUrl ?? '')
  const pat = ref(initialConfig?.pat ?? '')
  const username = ref(initialConfig?.username ?? '')
  const password = ref(initialConfig?.password ?? '')
  const rememberAuth = ref(initialConfig?.rememberAuth ?? false)

  const canSave = computed(() => {
    if (!siteUrl.value.trim()) return false
    if (authType.value === 'pat') {
      return !!pat.value.trim()
    }
    return !!(username.value.trim() && password.value.trim())
  })

  function resetForm(config?: AuthConfig | null) {
    if (config) {
      authType.value = config.type
      siteUrl.value = config.siteUrl
      pat.value = config.pat ?? ''
      username.value = config.username ?? ''
      password.value = config.password ?? ''
      rememberAuth.value = config.rememberAuth ?? false
    } else {
      authType.value = 'pat'
      siteUrl.value = ''
      pat.value = ''
      username.value = ''
      password.value = ''
      rememberAuth.value = false
    }
  }

  function clearForm() {
    authType.value = 'pat'
    siteUrl.value = ''
    pat.value = ''
    username.value = ''
    password.value = ''
    rememberAuth.value = false
  }

  function buildConfig(): AuthConfig | null {
    if (!canSave.value) return null

    return {
      type: authType.value,
      siteUrl: siteUrl.value.trim(),
      rememberAuth: rememberAuth.value,
      ...(authType.value === 'pat'
        ? { pat: pat.value.trim() }
        : { username: username.value.trim(), password: password.value.trim() }
      ),
    }
  }

  return {
    authType,
    siteUrl,
    pat,
    username,
    password,
    rememberAuth,
    resetForm,
    clearForm,
    buildConfig,
  }
}
