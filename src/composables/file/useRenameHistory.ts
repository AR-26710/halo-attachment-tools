import { ref, computed } from 'vue'
import { RENAME_HISTORY_ENABLED_KEY, RENAME_HISTORY_SESSION_KEY } from '@/constants'

export interface RenameRecord {
  originalName: string
  newName: string
}

export interface RenameHistoryEntry {
  id: string
  timestamp: number
  records: RenameRecord[]
}

function loadEnabledConfig(): boolean {
  try {
    const stored = localStorage.getItem(RENAME_HISTORY_ENABLED_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.error('Failed to load rename history enabled config')
  }
  return false
}

function saveEnabledConfig(enabled: boolean): void {
  try {
    localStorage.setItem(RENAME_HISTORY_ENABLED_KEY, JSON.stringify(enabled))
  } catch {
    console.error('Failed to save rename history enabled config')
  }
}

function loadSessionHistory(): RenameHistoryEntry[] {
  try {
    const stored = sessionStorage.getItem(RENAME_HISTORY_SESSION_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.error('Failed to load rename history from session')
  }
  return []
}

function saveSessionHistory(history: RenameHistoryEntry[]): void {
  try {
    sessionStorage.setItem(RENAME_HISTORY_SESSION_KEY, JSON.stringify(history))
  } catch {
    console.error('Failed to save rename history to session')
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function useRenameHistory() {
  const enabled = ref<boolean>(loadEnabledConfig())
  const history = ref<RenameHistoryEntry[]>(loadSessionHistory())

  const hasHistory = computed(() => history.value.length > 0)

  function setEnabled(value: boolean): void {
    enabled.value = value
    saveEnabledConfig(value)
  }

  function addHistoryEntry(records: RenameRecord[]): void {
    if (!enabled.value || records.length === 0) return

    const entry: RenameHistoryEntry = {
      id: generateId(),
      timestamp: Date.now(),
      records,
    }

    history.value = [entry, ...history.value]
    saveSessionHistory(history.value)
  }

  function clearHistory(): void {
    history.value = []
    saveSessionHistory([])
  }

  function removeHistoryEntry(id: string): void {
    history.value = history.value.filter(entry => entry.id !== id)
    saveSessionHistory(history.value)
  }

  function exportToJSON(): string {
    const data = {
      exportTime: new Date().toISOString(),
      totalEntries: history.value.length,
      entries: history.value.map(entry => ({
        timestamp: new Date(entry.timestamp).toISOString(),
        records: entry.records,
      })),
    }
    return JSON.stringify(data, null, 2)
  }

  function downloadJSON(): void {
    const json = exportToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rename-history-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    enabled,
    history,
    hasHistory,
    setEnabled,
    addHistoryEntry,
    clearHistory,
    removeHistoryEntry,
    exportToJSON,
    downloadJSON,
  }
}
