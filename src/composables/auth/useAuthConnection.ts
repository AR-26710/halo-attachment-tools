import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuthConnection() {
  const authStore = useAuthStore()
  const { isAuthenticated, authConfig, testing, testResult, hasExistingConfig, isReady } = storeToRefs(authStore)

  return {
    isAuthenticated,
    authConfig,
    testing,
    testResult,
    hasExistingConfig,
    isReady,
    initAuth: authStore.initAuth,
    checkAuth: authStore.checkAuth,
    testConnection: authStore.testConnection,
    saveConfig: authStore.saveConfig,
    clearConfig: authStore.clearConfig,
  }
}
