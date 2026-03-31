import type { ApiClient } from '@/api/core'
import type { Attachment } from '@/types'

export class AttachmentApi {
  private readonly client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

  async uploadFile(
    file: File,
    policyName: string,
    groupName?: string,
    onProgress?: (progress: number) => void
  ): Promise<Attachment> {
    return this.client.upload(async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('policyName', policyName)
      if (groupName) {
        formData.append('groupName', groupName)
      }

      const response = await this.client.getClient().post<Attachment>(
        '/apis/api.console.halo.run/v1alpha1/attachments/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(progress)
            }
          },
        }
      )

      return response.data
    }, 10)
  }
}
