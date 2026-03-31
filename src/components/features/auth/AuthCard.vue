<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  isAuthenticated: boolean
  siteUrl?: string
}

defineProps<Props>()

defineEmits<(e: 'configure') => void>()
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4 flex flex-row items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          :class="[
            'w-3 h-3 rounded-full',
            isAuthenticated ? 'bg-success' : 'bg-error'
          ]"
        ></div>
        <div>
          <h3 class="font-medium text-sm">
            {{ isAuthenticated ? '已连接' : '未连接' }}
          </h3>
          <p v-if="isAuthenticated && siteUrl" class="text-xs text-base-content/60">
            {{ siteUrl }}
          </p>
          <p v-else class="text-xs text-base-content/60">
            请配置 Halo 站点连接
          </p>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" @click="$emit('configure')">
        <Icon icon="mdi:cog" class="h-4 w-4 mr-1" />
        {{ isAuthenticated ? '修改配置' : '配置连接' }}
      </button>
    </div>
  </div>
</template>
