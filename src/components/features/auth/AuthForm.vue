<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import SiteUrlInput from './auth-form/SiteUrlInput.vue'
import AuthTypeSelector from './auth-form/AuthTypeSelector.vue'
import PatInput from './auth-form/PatInput.vue'
import BasicAuthInput from './auth-form/BasicAuthInput.vue'
import TestResultAlert from './auth-form/TestResultAlert.vue'
import FormActions from './auth-form/FormActions.vue'

type AuthType = 'pat' | 'basic'

const props = defineProps<{
  authType: AuthType
  siteUrl: string
  pat: string
  username: string
  password: string
  rememberAuth: boolean
  testing: boolean
  testResult: { success: boolean; message: string } | null
  hasExistingConfig: boolean
  noCard?: boolean
  showCancel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:authType', value: AuthType): void
  (e: 'update:siteUrl', value: string): void
  (e: 'update:pat', value: string): void
  (e: 'update:username', value: string): void
  (e: 'update:password', value: string): void
  (e: 'update:rememberAuth', value: boolean): void
  (e: 'test'): void
  (e: 'save'): void
  (e: 'clear'): void
  (e: 'cancel'): void
}>()

const siteUrlInputRef = ref<InstanceType<typeof SiteUrlInput> | null>(null)
const patInputRef = ref<InstanceType<typeof PatInput> | null>(null)
const basicAuthInputRef = ref<InstanceType<typeof BasicAuthInput> | null>(null)

const canSave = computed(() => {
  const isSiteUrlValid = siteUrlInputRef.value?.isValid ?? false
  if (!isSiteUrlValid) return false

  if (props.authType === 'pat') {
    return patInputRef.value?.isValid ?? false
  }

  return basicAuthInputRef.value?.isValid ?? false
})
</script>

<template>
  <div :class="noCard ? '' : 'card bg-base-100 shadow-xl'">
    <div :class="noCard ? '' : 'card-body p-4 md:p-6'">
      <h2 class="card-title text-xl md:text-2xl mb-4 md:mb-6">
        <Icon icon="mdi:cog-outline" class="h-5 w-5 md:h-6 md:w-6" />
        认证配置
      </h2>

      <form class="space-y-4 md:space-y-6" @submit.prevent>
        <section class="space-y-3 md:space-y-4">
          <SiteUrlInput
            ref="siteUrlInputRef"
            :model-value="siteUrl"
            @update:model-value="emit('update:siteUrl', $event)"
          />

          <AuthTypeSelector
            :model-value="authType"
            @update:model-value="emit('update:authType', $event)"
          />
        </section>

        <div class="divider my-0"></div>

        <section class="space-y-3 md:space-y-4">
          <PatInput
            v-if="authType === 'pat'"
            ref="patInputRef"
            :model-value="pat"
            @update:model-value="emit('update:pat', $event)"
          />

          <BasicAuthInput
            v-else
            ref="basicAuthInputRef"
            :username="username"
            :password="password"
            @update:username="emit('update:username', $event)"
            @update:password="emit('update:password', $event)"
          />
        </section>

        <div class="divider my-0"></div>

        <section class="space-y-3 md:space-y-4">
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3 py-0">
              <input
                type="checkbox"
                :checked="rememberAuth"
                class="checkbox checkbox-sm checkbox-primary"
                @change="emit('update:rememberAuth', ($event.target as HTMLInputElement).checked)"
              />
              <span class="label-text">记住认证（关闭浏览器后仍保留）</span>
            </label>
            <div class="label py-0 mt-1">
              <span class="label-text-alt text-base-content/60">
                不勾选时，关闭浏览器后认证信息将被清除
              </span>
            </div>
          </div>

          <TestResultAlert :result="testResult" />
        </section>

        <FormActions
          :can-save="canSave"
          :testing="testing"
          :has-existing-config="hasExistingConfig"
          :show-cancel="showCancel"
          @clear="emit('clear')"
          @test="emit('test')"
          @save="emit('save')"
          @cancel="emit('cancel')"
        />
      </form>
    </div>
  </div>
</template>
