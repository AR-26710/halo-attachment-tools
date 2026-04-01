import { ref, computed, watch } from 'vue'
import type { AuthConfig } from '@/types'

const AUTH_FORM_DRAFT_KEY = 'halo_auth_form_draft'

type AuthType = 'pat' | 'basic'

interface FormDraft {
  authType: AuthType
  siteUrl: string
  pat: string
  username: string
  password: string
  rememberAuth: boolean
}

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

  function saveDraft() {
    const draft: FormDraft = {
      authType: authType.value,
      siteUrl: siteUrl.value,
      pat: pat.value,
      username: username.value,
      password: password.value,
      rememberAuth: rememberAuth.value,
    }
    sessionStorage.setItem(AUTH_FORM_DRAFT_KEY, JSON.stringify(draft))
  }

  function loadDraft(): FormDraft | null {
    const stored = sessionStorage.getItem(AUTH_FORM_DRAFT_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }

  function clearDraft() {
    sessionStorage.removeItem(AUTH_FORM_DRAFT_KEY)
  }

  function resetForm(config?: AuthConfig | null) {
    if (config) {
      authType.value = config.type
      siteUrl.value = config.siteUrl
      pat.value = config.pat ?? ''
      username.value = config.username ?? ''
      password.value = config.password ?? ''
      rememberAuth.value = config.rememberAuth ?? false
      clearDraft()
    } else {
      const draft = loadDraft()
      if (draft) {
        authType.value = draft.authType
        siteUrl.value = draft.siteUrl
        pat.value = draft.pat
        username.value = draft.username
        password.value = draft.password
        rememberAuth.value = draft.rememberAuth
      } else {
        authType.value = 'pat'
        siteUrl.value = ''
        pat.value = ''
        username.value = ''
        password.value = ''
        rememberAuth.value = false
      }
    }
  }

  function clearForm() {
    authType.value = 'pat'
    siteUrl.value = ''
    pat.value = ''
    username.value = ''
    password.value = ''
    rememberAuth.value = false
    clearDraft()
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

  watch([authType, siteUrl, pat, username, password, rememberAuth], () => {
    const hasAnyValue = siteUrl.value || pat.value || username.value || password.value
    if (hasAnyValue) {
      saveDraft()
    }
  }, { deep: true })

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
    clearDraft,
  }
}
