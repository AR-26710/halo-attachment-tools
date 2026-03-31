export interface Group {
  apiVersion: string
  kind: string
  metadata: {
    name: string
    creationTimestamp?: string
    labels?: Record<string, string>
    [key: string]: unknown
  }
  spec: {
    displayName: string
    [key: string]: unknown
  }
  status?: {
    totalAttachments?: number
  }
  [key: string]: unknown
}

export interface GroupList {
  items: Group[]
  total: number
}
