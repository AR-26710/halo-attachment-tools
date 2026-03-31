import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: [
      'dist/**',
      'dist-ssr/**',
      'coverage/**',
      'tmp/**',
      'node_modules/**',
      'scripts/**',
      '**/*.d.ts',
      '*.config.js',
      '*.config.ts'
    ],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
)
