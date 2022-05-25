import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno } from 'unocss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    unocss({
      presets: [
        presetUno(),
        presetIcons(),
        presetAttributify(),
      ],
    }),
  ],
  base: './',
  resolve: {
    alias: { '@': 'src' },
  },
  publicDir: 'public',
})
