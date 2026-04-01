<script setup lang="ts">
import { watch } from 'vue'
import { AuthForm } from '.'
import { useAuthForm, useAuthConnection } from '@/composables/auth'
import type { AuthConfig } from '@/types'

interface Props {
  show: boolean
  initialConfig?: AuthConfig | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
  (e: 'cleared'): void
}>()

const {
  authType,
  siteUrl,
  pat,
  username,
  password,
  rememberAuth,
  resetForm,
  clearForm,
  buildConfig,
  clearDraft,
} = useAuthForm(props.initialConfig)

const {
  testing,
  testResult,
  hasExistingConfig,
  testConnection,
  saveConfig,
  clearConfig,
} = useAuthConnection()

watch(() => props.show, async (show) => {
  if (show) {
    await resetForm(props.initialConfig)
  }
})

async function handleTest() {
  const config = buildConfig()
  if (!config) return

  await testConnection(config)
}

async function handleSave() {
  const config = buildConfig()
  if (!config) return

  await saveConfig(config)
  clearDraft()
  emit('saved')
  emit('close')
}

function handleClear() {
  clearConfig()
  clearForm()
  emit('cleared')
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box max-w-lg">
      <AuthForm
        v-model:auth-type="authType"
        v-model:site-url="siteUrl"
        v-model:pat="pat"
        v-model:username="username"
        v-model:password="password"
        v-model:remember-auth="rememberAuth"
        :testing="testing"
        :test-result="testResult"
        :has-existing-config="hasExistingConfig"
        :no-card="true"
        :show-cancel="true"
        @test="handleTest"
        @save="handleSave"
        @clear="handleClear"
        @cancel="handleClose"
      />
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>
