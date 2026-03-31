import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type Theme = 'light' | 'dark' | 'system'

function getSystemTheme(): 'light' | 'dark' {
  if (globalThis.window === undefined) return 'light'
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useAppStore = defineStore(
  'app',
  () => {
    const theme = ref<Theme>('system')

    const effectiveTheme = computed(() => {
      return theme.value === 'system' ? getSystemTheme() : theme.value
    })

    const isDark = computed(() => effectiveTheme.value === 'dark')

    function setTheme(newTheme: Theme) {
      theme.value = newTheme
      applyTheme(newTheme)
    }

    function applyTheme(currentTheme: Theme) {
      if (document === undefined) return

      const root = document.documentElement
      const effective = currentTheme === 'system' ? getSystemTheme() : currentTheme

      if (effective === 'dark') {
          root.dataset.theme = 'dark'
      } else {
          root.dataset.theme = 'light'
      }
    }

    function cycleTheme() {
      const order: Theme[] = ['light', 'dark', 'system']
      const currentIndex = order.indexOf(theme.value)
      const nextIndex = (currentIndex + 1) % order.length
      const nextTheme = order[nextIndex]
      if (nextTheme) {
        setTheme(nextTheme)
      }
    }

    function initTheme() {
      if (globalThis.window === undefined) return

      applyTheme(theme.value)

      const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (theme.value === 'system') {
          applyTheme('system')
        }
      })
    }

    return {
      theme,
      effectiveTheme,
      isDark,
      cycleTheme,
      initTheme,
    }
  },
  {
    persist: {
      pick: ['theme'],
    },
  }
)
