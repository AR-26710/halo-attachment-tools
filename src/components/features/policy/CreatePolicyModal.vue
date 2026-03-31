<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { haloApi } from '@/api'
import type { Policy, PolicyTemplate, Setting, FormSchemaItem } from '@/types'

const props = defineProps<{
  show: boolean
  policies: Policy[]
  policyTemplates: PolicyTemplate[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', policy: Policy): void
}>()

const displayName = ref('')
const selectedTemplate = ref('')
const isSubmitting = ref(false)
const isLoadingSetting = ref(false)
const error = ref('')

const setting = ref<Setting | null>(null)
const configValues = ref<Record<string, unknown>>({})

const availableTemplates = computed(() => {
  return props.policyTemplates.filter(template => template.spec?.displayName)
})

const locationField = computed((): FormSchemaItem | null => {
  if (!setting.value) return null
  const forms = setting.value.spec?.forms || []
  const defaultForm = forms.find(f => f.group === 'default')
  if (!defaultForm?.formSchema) return null
  
  const locationKeywords = ['location', 'path', 'bucket', 'basepath', 'base-path', 'filepath', 'file-path']
  
  for (const item of defaultForm.formSchema) {
    const name = item.name?.toLowerCase() || ''
    const label = (item.label as string)?.toLowerCase() || ''
    if (locationKeywords.some(keyword => name.includes(keyword) || label.includes(keyword))) {
      return item
    }
  }
  
  return defaultForm.formSchema[0] || null
})

watch(() => props.show, (show) => {
  if (show && availableTemplates.value.length === 1) {
    selectedTemplate.value = availableTemplates.value[0].metadata.name
  }
})

watch(selectedTemplate, async (templateName) => {
  if (!templateName) {
    setting.value = null
    configValues.value = {}
    return
  }

  const template = props.policyTemplates.find(t => t.metadata.name === templateName)
  if (!template?.spec?.settingName) {
    setting.value = null
    configValues.value = {}
    return
  }

  try {
    isLoadingSetting.value = true
    setting.value = await haloApi.policies.getSetting(template.spec.settingName)
    
    const defaultValues: Record<string, unknown> = {}
    if (locationField.value?.name && locationField.value.value !== undefined) {
      defaultValues[locationField.value.name] = locationField.value.value
    }
    configValues.value = defaultValues
  } catch (e) {
    console.error('Failed to load setting:', e)
    setting.value = null
  } finally {
    isLoadingSetting.value = false
  }
})

function getFormKitType(item: FormSchemaItem): string {
  const type = item.$formkit || 'text'
  const typeMap: Record<string, string> = {
    'text': 'text',
    'number': 'number',
    'password': 'password',
    'email': 'email',
    'url': 'url',
    'tel': 'tel',
    'textarea': 'textarea',
    'select': 'select',
    'checkbox': 'checkbox',
    'radio': 'radio',
    'date': 'date',
    'time': 'time',
    'datetime-local': 'datetime-local',
    'color': 'color',
    'range': 'range',
    'file': 'file'
  }
  return typeMap[type] || 'text'
}

function getOptions(item: FormSchemaItem): Array<{ label: string; value: string }> {
  if (!item.options) return []
  
  if (Array.isArray(item.options)) {
    return item.options
  }
  
  return Object.entries(item.options).map(([value, label]) => ({
    label: String(label),
    value
  }))
}

async function handleSubmit() {
  if (!displayName.value.trim()) {
    error.value = '策略名称不能为空'
    return
  }

  if (!selectedTemplate.value) {
    error.value = '请选择策略模板'
    return
  }

  const hasDuplicate = props.policies.some(
    (policy) => policy.spec.displayName === displayName.value.trim()
  )

  if (hasDuplicate) {
    error.value = '策略名称已存在'
    return
  }

  try {
    isSubmitting.value = true
    error.value = ''
    
    const newPolicy = await haloApi.policies.createPolicy(
      displayName.value.trim(),
      selectedTemplate.value,
      configValues.value
    )
    
    emit('created', newPolicy)
    handleClose()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '创建策略失败'
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  displayName.value = ''
  selectedTemplate.value = ''
  error.value = ''
  setting.value = null
  configValues.value = {}
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box max-w-md">
      <h3 class="font-bold text-lg mb-4">创建存储策略</h3>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">策略模板 *</span>
          </label>
          <select
            v-model="selectedTemplate"
            class="select select-bordered w-full"
            :disabled="isSubmitting"
          >
            <option value="" disabled>请选择策略模板</option>
            <option
              v-for="template in availableTemplates"
              :key="template.metadata.name"
              :value="template.metadata.name"
            >
              {{ template.spec.displayName }}
            </option>
          </select>
          <label v-if="availableTemplates.length === 0" class="label">
            <span class="label-text-alt text-warning">没有可用的策略模板</span>
          </label>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">策略名称 *</span>
          </label>
          <input
            v-model="displayName"
            type="text"
            placeholder="请输入策略名称"
            class="input input-bordered w-full"
            :disabled="isSubmitting"
            maxlength="50"
          />
        </div>

        <div v-if="isLoadingSetting" class="flex justify-center py-4">
          <span class="loading loading-spinner loading-md"></span>
        </div>

        <template v-else-if="locationField">
          <div class="divider">存储配置</div>
          
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">{{ locationField.label || '存储位置' }}</span>
            </label>
            
            <template v-if="getFormKitType(locationField) === 'select'">
              <select
                v-model="configValues[locationField.name!]"
                class="select select-bordered w-full"
                :disabled="isSubmitting"
              >
                <option
                  v-for="opt in getOptions(locationField)"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </template>
            
            <template v-else-if="getFormKitType(locationField) === 'textarea'">
              <textarea
                v-model="configValues[locationField.name!] as string"
                class="textarea textarea-bordered w-full"
                :placeholder="locationField.placeholder"
                :disabled="isSubmitting"
              ></textarea>
            </template>
            
            <template v-else>
              <input
                v-model="configValues[locationField.name!]"
                :type="getFormKitType(locationField)"
                class="input input-bordered w-full"
                :placeholder="locationField.placeholder"
                :disabled="isSubmitting"
              />
            </template>
            
            <label v-if="locationField.help" class="label">
              <span class="label-text-alt text-base-content/60">{{ locationField.help }}</span>
            </label>
          </div>
        </template>

        <div v-if="error" class="alert alert-error mt-4 text-sm">
          {{ error }}
        </div>

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="isSubmitting"
            @click="handleClose"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !displayName.trim() || !selectedTemplate"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
            创建
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>
