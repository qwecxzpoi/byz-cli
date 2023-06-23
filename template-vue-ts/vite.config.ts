/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno } from 'unocss'

// https://vitejs.dev/config/
export default defineConfig({
  // https://cn.vitest.dev/config/
  test: {
  },
  plugins: [
    vue(),
    Unocss({
      presets: [
        presetUno(),
        presetIcons(),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
