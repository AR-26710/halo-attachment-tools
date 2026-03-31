import type { ApiClient } from '@/api/core'
import type { Group, GroupList } from '@/types'

export class GroupApi {
  private readonly client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

  async getGroups(): Promise<Group[]> {
    return this.client.request(async () => {
      const response = await this.client.getClient().get<GroupList>('/apis/storage.halo.run/v1alpha1/groups')
      return response.data.items || []
    })
  }

  async createGroup(displayName: string): Promise<Group> {
    return this.client.request(async () => {
      const groupData: Group = {
        apiVersion: 'storage.halo.run/v1alpha1',
        kind: 'Group',
        metadata: {
          name: '',
          generateName: 'attachment-group-'
        },
        spec: {
          displayName
        }
      }

      const response = await this.client.getClient().post<Group>('/apis/storage.halo.run/v1alpha1/groups', groupData)
      return response.data
    })
  }
}
