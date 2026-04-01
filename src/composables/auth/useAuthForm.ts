import { ref, computed, watch } from 'vue'
import type { AuthConfig } from '@/types'

const STORAGE_KEY = 'halo_auth_form_draft' as const

type AuthType = 'pat' | 'basic'

interface FormState {
  authType: AuthType
  siteUrl: string
  pat: string
  username: string
  password: string
  rememberAuth: boolean
}

type FormField = keyof FormState

const DEFAULT_STATE: FormState = {
  authType: 'pat',
  siteUrl: '',
  pat: '',
  username: '',
  password: '',
  rememberAuth: false,
}

export function useAuthForm(initialConfig?: AuthConfig | null) {

  const state = {
    authType: ref<AuthType>(initialConfig?.type ?? DEFAULT_STATE.authType),
    siteUrl: ref(initialConfig?.siteUrl ?? DEFAULT_STATE.siteUrl),
    pat: ref(initialConfig?.pat ?? DEFAULT_STATE.pat),
    username: ref(initialConfig?.username ?? DEFAULT_STATE.username),
    password: ref(initialConfig?.password ?? DEFAULT_STATE.password),
    rememberAuth: ref(initialConfig?.rememberAuth ?? DEFAULT_STATE.rememberAuth),
  }

  const isValid = computed(() => {
    const { siteUrl, authType, pat, username, password } = state

    if (!siteUrl.value.trim()) return false

    return authType.value === 'pat'
      ? Boolean(pat.value.trim())
      : Boolean(username.value.trim() && password.value.trim())
  })

  const getCurrentState = (): FormState => ({
    authType: state.authType.value,
    siteUrl: state.siteUrl.value,
    pat: state.pat.value,
    username: state.username.value,
    password: state.password.value,
    rememberAuth: state.rememberAuth.value,
  })

  const setState = (newState: Partial<FormState>) => {
    Object.entries(newState).forEach(([key, value]) => {
      const fieldKey = key as FormField
      if (fieldKey in state) {
        state[fieldKey].value = value
      }
    })
  }

  const saveDraft = (): void => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(getCurrentState()))
  }

  const loadDraft = (): FormState | null => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored) as FormState
    } catch {
      console.warn('Failed to parse auth form draft')
      return null
    }
  }

  const clearDraft = (): void => {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const resetForm = (config?: AuthConfig | null): void => {
    clearDraft()

    if (config) {
      setState({
        authType: config.type,
        siteUrl: config.siteUrl,
        pat: config.pat ?? DEFAULT_STATE.pat,
        username: config.username ?? DEFAULT_STATE.username,
        password: config.password ?? DEFAULT_STATE.password,
        rememberAuth: config.rememberAuth ?? DEFAULT_STATE.rememberAuth,
      })
      return
    }

    const draft = loadDraft()
    setState(draft ?? DEFAULT_STATE)
  }

  const clearForm = (): void => {
    setState(DEFAULT_STATE)
    clearDraft()
  }

  const buildConfig = (): AuthConfig | null => {
    if (!isValid.value) return null

    const { authType, siteUrl, rememberAuth } = state
    const trimmedSiteUrl = siteUrl.value.trim()

    const baseConfig = {
      type: authType.value,
      siteUrl: trimmedSiteUrl,
      rememberAuth: rememberAuth.value,
    }

    if (authType.value === 'pat') {
      return { ...baseConfig, pat: state.pat.value.trim() }
    }

    return {
      ...baseConfig,
      username: state.username.value.trim(),
      password: state.password.value.trim(),
    }
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  watch(
    [state.authType, state.siteUrl, state.pat, state.username, state.password, state.rememberAuth],
    () => {
      const hasAnyValue = state.siteUrl.value || state.pat.value || state.username.value || state.password.value

      if (!hasAnyValue) return

      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(saveDraft, 300)
    },
    { deep: true }
  )

  return {
    authType: state.authType,
    siteUrl: state.siteUrl,
    pat: state.pat,
    username: state.username,
    password: state.password,
    rememberAuth: state.rememberAuth,
    canSave: isValid,
    resetForm,
    clearForm,
    buildConfig,
    clearDraft,
  }
}