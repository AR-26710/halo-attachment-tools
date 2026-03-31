<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'ASkeleton',
})

interface Props {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string
  height?: string
  animation?: 'pulse' | 'wave' | 'none'
  lines?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  animation: 'pulse',
  lines: 1,
})

const skeletonStyle = computed(() => {
  const width = props.width || (props.variant === 'text' ? `${Math.random() * 30 + 70}%` : '100%')
  const height = props.height || (props.variant === 'text' ? '1em' : '100px')
  return { width, height }
})

const skeletonClass = computed(() => [
  props.variant === 'circular' ? 'rounded-full' : props.variant === 'rounded' ? 'rounded-lg' : 'rounded',
  props.animation === 'pulse' ? 'animate-pulse' : props.animation === 'wave' ? 'skeleton-wave' : '',
])
</script>

<template>
  <div v-if="lines > 1" class="space-y-2 w-full">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton"
      :class="skeletonClass"
      :style="skeletonStyle"
    />
  </div>
  <div
    v-else
    class="skeleton"
    :class="skeletonClass"
    :style="skeletonStyle"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    oklch(var(--b2)) 25%,
    oklch(var(--b3)) 50%,
    oklch(var(--b2)) 75%
  );
  background-size: 200% 100%;
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
