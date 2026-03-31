export interface Attachment {
  apiVersion: string
  kind: string
  metadata: {
    name: string
    creationTimestamp?: string
    [key: string]: unknown
  }
  spec: {
    displayName: string
    mediaType?: string
    size?: number
    [key: string]: unknown
  }
  status?: {
    permalink?: string
    [key: string]: unknown
  }
}
