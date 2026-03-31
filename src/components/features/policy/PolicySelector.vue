<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Policy, PolicyTemplate } from '@/types'
import CreatePolicyModal from './CreatePolicyModal.vue'

defineProps<{
  policies: Policy[]
  policyTemplates: PolicyTemplate[]
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'created'): void
}>()

const showCreateModal = ref(false)

function handlePolicyCreated(policy: Policy) {
  emit('update:modelValue', policy.metadata.name)
  emit('created')
}
</script>

<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text font-medium text-sm md:text-base">存储策略 *</span>
    </label>
    <div class="flex gap-2">
      <select
        :value="modelValue"
        class="select select-bordered select-sm md:select-md flex-1"
        :disabled="disabled"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>选择存储策略</option>
        <option
          v-for="policy in policies"
          :key="policy.metadata.name"
          :value="policy.metadata.name"
        >
          {{ policy.spec.displayName }}
        </option>
      </select>
      <button
        type="button"
        class="btn btn-outline btn-sm md:btn-md"
        :disabled="disabled"
        title="创建新策略"
        @click="showCreateModal = true"
      >
        <Icon icon="mdi:plus" class="h-4 w-4" />
      </button>
    </div>

    <CreatePolicyModal
      :show="showCreateModal"
      :policies="policies"
      :policy-templates="policyTemplates"
      @close="showCreateModal = false"
      @created="handlePolicyCreated"
    />
  </div>
</template>
