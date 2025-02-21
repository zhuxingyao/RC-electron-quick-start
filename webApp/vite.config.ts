import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: '../webApp/dist', // 让 Vite 构建到 Electron 可访问的目录
    emptyOutDir: true
  },
})
