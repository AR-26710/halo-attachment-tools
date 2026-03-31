<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  secondaryActionLabel?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact'
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi:cloud-off-outline',
  size: 'md',
  variant: 'default',
})

defineEmits<{
  (e: 'action'): void
  (e: 'secondaryAction'): void
}>()

const sizeConfig = {
  sm: {
    icon: 'h-10 w-10',
    title: 'text-base',
    description: 'text-xs',
    padding: 'py-6',
  },
  md: {
    icon: 'h-16 w-16',
    title: 'text-lg',
    description: 'text-sm',
    padding: 'py-12',
  },
  lg: {
    icon: 'h-24 w-24',
    title: 'text-xl',
    description: 'text-base',
    padding: 'py-16',
  },
}
</script>

<template>
  <div
    class="card bg-base-200/50 border border-base-300/50"
    :class="variant === 'compact' ? 'py-6' : sizeConfig[size].padding"
  >
    <div class="card-body items-center text-center">
      <div
        class="rounded-full bg-base-300/50 flex items-center justify-center mb-4"
        :class="size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-32 h-32' : 'w-24 h-24'"
      >
        <Icon
          :icon="icon"
          class="text-base-content/30"
          :class="sizeConfig[size].icon"
        />
      </div>

      <h3
        class="font-medium mb-2"
        :class="sizeConfig[size].title"
      >
        {{ title }}
      </h3>

      <p
        v-if="description"
        class="text-base-content/60 max-w-sm mb-4"
        :class="sizeConfig[size].description"
      >
        {{ description }}
      </p>

      <div class="flex items-center gap-3">
        <button
          v-if="actionLabel"
          class="btn btn-primary"
          :class="size === 'sm' ? 'btn-sm' : ''"
          @click="$emit('action')"
        >
          <Icon icon="mdi:connection" class="h-4 w-4 mr-2" />
          {{ actionLabel }}
        </button>
        <button
          v-if="secondaryActionLabel"
          class="btn btn-ghost"
          :class="size === 'sm' ? 'btn-sm' : ''"
          @click="$emit('secondaryAction')"
        >
          {{ secondaryActionLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
