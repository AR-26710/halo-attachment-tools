<script setup lang="ts">
interface Props {
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  shadow: 'sm',
  padding: 'md',
})

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}
</script>

<template>
  <div class="card bg-base-100 border border-base-200" :class="[shadowClasses[shadow]]">
    <div class="card-body" :class="[paddingClasses[padding]]">
      <slot />
    </div>
  </div>
</template>
