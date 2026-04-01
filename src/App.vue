<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { AppLayout } from '@/layouts'
import { AppHeader } from '@/components/ui'
import { AttachmentUploadView } from '@/views'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

onMounted(() => {
  appStore.initTheme()
})

const attachmentUploadViewRef = ref<InstanceType<typeof AttachmentUploadView> | null>(null)

function handleOpenConfig() {
  attachmentUploadViewRef.value?.openConfigModal()
}
</script>

<template>
  <AppLayout>
    <template #header>
      <AppHeader
        title="Halo 附件工具"
        subtitle="上传附件到你的 Halo 站点"
        @open-config="handleOpenConfig"
      />
    </template>

    <AttachmentUploadView ref="attachmentUploadViewRef" />
  </AppLayout>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

body {
  display: block !important;
  place-items: unset;
}
</style>
