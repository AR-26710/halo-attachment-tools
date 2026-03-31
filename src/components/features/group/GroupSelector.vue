<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Group } from '@/types'
import CreateGroupModal from './CreateGroupModal.vue'

defineProps<{
  groups: Group[]
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'created'): void
}>()

const showCreateModal = ref(false)

function handleGroupCreated(group: Group) {
  emit('update:modelValue', group.metadata.name)
  emit('created')
}
</script>

<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text font-medium text-sm md:text-base">分组（可选）</span>
    </label>
    <div class="flex gap-2">
      <select
        :value="modelValue"
        class="select select-bordered select-sm md:select-md flex-1"
        :disabled="disabled"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">不选择分组</option>
        <option
          v-for="group in groups"
          :key="group.metadata.name"
          :value="group.metadata.name"
        >
          {{ group.spec.displayName }}
          <span v-if="group.status?.totalAttachments" class="text-base-content/60">
            ({{ group.status.totalAttachments }})
          </span>
        </option>
      </select>
      <button
        type="button"
        class="btn btn-outline btn-sm md:btn-md"
        :disabled="disabled"
        title="创建新分组"
        @click="showCreateModal = true"
      >
        <Icon icon="mdi:plus" class="h-4 w-4" />
      </button>
    </div>

    <CreateGroupModal
      :show="showCreateModal"
      :groups="groups"
      @close="showCreateModal = false"
      @created="handleGroupCreated"
    />
  </div>
</template>
