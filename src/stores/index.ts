import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export { useAppStore } from './app'
export { useAuthStore } from './auth'

export function setupPinia() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  return pinia
}
