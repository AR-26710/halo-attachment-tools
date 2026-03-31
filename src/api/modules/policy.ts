import type { ApiClient } from '@/api/core'
import type { Policy, PolicyList, PolicyTemplate, PolicyTemplateList, Setting } from '@/types'

interface ConfigMap {
  apiVersion: string
  kind: string
  metadata: {
    name: string
    generateName?: string
    [key: string]: unknown
  }
  data?: Record<string, string>
}

export class PolicyApi {
  private readonly client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

  async getPolicies(): Promise<Policy[]> {
    return this.client.request(async () => {
      const response = await this.client.getClient().get<PolicyList>('/apis/storage.halo.run/v1alpha1/policies')
      return response.data.items || []
    })
  }

  async getPolicyTemplates(): Promise<PolicyTemplate[]> {
    return this.client.request(async () => {
      const response = await this.client.getClient().get<PolicyTemplateList>('/apis/storage.halo.run/v1alpha1/policytemplates')
      return response.data.items || []
    })
  }
  async getSetting(name: string): Promise<Setting> {
    return this.client.request(async () => {
      const response = await this.client.getClient().get<Setting>(`/api/v1alpha1/settings/${name}`)
      return response.data
    })
  }

  private async createConfigMap(data: Record<string, string> = {}): Promise<ConfigMap> {
    return this.client.request(async () => {
      const configMap: ConfigMap = {
        apiVersion: 'v1alpha1',
        kind: 'ConfigMap',
        metadata: {
          name: '',
          generateName: 'configMap-'
        },
        data
      }

      const response = await this.client.getClient().post<ConfigMap>('/api/v1alpha1/configmaps', configMap)
      return response.data
    })
  }

  async createPolicy(displayName: string, templateName: string, config: Record<string, unknown> = {}): Promise<Policy> {
    return this.client.request(async () => {
      const configMap = await this.createConfigMap({
        default: JSON.stringify(config)
      })

      const policyData: Policy = {
        apiVersion: 'storage.halo.run/v1alpha1',
        kind: 'Policy',
        metadata: {
          name: '',
          generateName: 'attachment-policy-',
          labels: {}
        },
        spec: {
          displayName,
          templateName,
          configMapName: configMap.metadata.name
        }
      }

      const response = await this.client.getClient().post<Policy>('/apis/storage.halo.run/v1alpha1/policies', policyData)
      return response.data
    })
  }
}
