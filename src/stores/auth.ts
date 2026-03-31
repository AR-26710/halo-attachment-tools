import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { haloApi } from '@/api'
import type { AuthConfig } from '@/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const isAuthenticated = ref(false)
    const authConfig = ref<AuthConfig | null>(null)
    const testing = ref(false)
    const testResult = ref<{ success: boolean; message: string } | null>(null)
    const isReady = ref(false)

    const hasExistingConfig = computed(() => {
      return isAuthenticated.value
    })

    async function initAuth(): Promise<void> {
      await haloApi.ready()
      checkAuth()
      isReady.value = true
    }

    function checkAuth() {
      isAuthenticated.value = haloApi.isAuthenticated()
      authConfig.value = haloApi.getAuthConfig()
    }

    async function testConnection(config: AuthConfig): Promise<boolean> {
      testing.value = true
      testResult.value = null

      await haloApi.saveAuthConfig(config)
      const result = await haloApi.testConnection()

      testResult.value = {
        success: result.success,
        message: result.success ? '连接成功！' : result.error || '连接失败',
      }
      testing.value = false

      setTimeout(() => {
        testResult.value = null
      }, 3000)

      return result.success
    }

    async function saveConfig(config: AuthConfig): Promise<void> {
      await haloApi.saveAuthConfig(config)
      authConfig.value = config
      isAuthenticated.value = true
    }

    function clearConfig() {
      haloApi.clearAuthConfig()
      authConfig.value = null
      isAuthenticated.value = false
      testResult.value = null
    }

    return {
      isAuthenticated,
      authConfig,
      testing,
      testResult,
      hasExistingConfig,
      isReady,
      initAuth,
      checkAuth,
      testConnection,
      saveConfig,
      clearConfig,
    }
  }
)
