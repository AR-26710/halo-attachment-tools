<script setup lang="ts">
import { ref } from 'vue'
import { haloApi } from '@/api'
import type { Group } from '@/types'

const props = defineProps<{
  show: boolean
  groups: Group[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', group: Group): void
}>()

const displayName = ref('')
const isSubmitting = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!displayName.value.trim()) {
    error.value = '分组名称不能为空'
    return
  }

  const hasDuplicate = props.groups.some(
    (group) => group.spec.displayName === displayName.value.trim()
  )

  if (hasDuplicate) {
    error.value = '分组名称已存在'
    return
  }

  try {
    isSubmitting.value = true
    error.value = ''
    
    const newGroup = await haloApi.groups.createGroup(displayName.value.trim())
    emit('created', newGroup)
    handleClose()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '创建分组失败'
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  displayName.value = ''
  error.value = ''
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box max-w-md">
      <h3 class="font-bold text-lg mb-4">创建分组</h3>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">分组名称 *</span>
          </label>
          <input
            v-model="displayName"
            type="text"
            placeholder="请输入分组名称"
            class="input input-bordered w-full"
            :disabled="isSubmitting"
            maxlength="50"
          />
        </div>

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
            :disabled="isSubmitting || !displayName.trim()"
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
