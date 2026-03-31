export interface Policy {
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
    templateName: string
    configMapName?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface PolicyList {
  items: Policy[]
  total: number
}

export interface PolicyTemplate {
  apiVersion: string
  kind: string
  metadata: {
    name: string
    creationTimestamp?: string
    [key: string]: unknown
  }
  spec: {
    displayName: string
    settingName: string
  }
}

export interface PolicyTemplateList {
  items: PolicyTemplate[]
  total: number
}

export interface SettingForm {
  formSchema: FormSchemaItem[]
  group: string
  label?: string
}

export interface FormSchemaItem {
  $formkit?: string
  name?: string
  label?: string
  value?: unknown
  validation?: string
  help?: string
  placeholder?: string
  options?: Array<{ label: string; value: string }> | Record<string, string>
  [key: string]: unknown
}

export interface Setting {
  apiVersion: string
  kind: string
  metadata: {
    name: string
    [key: string]: unknown
  }
  spec: {
    forms: SettingForm[]
  }
}
