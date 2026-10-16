import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // Pre-bundle up front, otherwise Vite finds it late and the first load
  // fails with "Outdated Optimize Dep"
  optimizeDeps: {
    include: ['maplibre-gl'],
  },
})
