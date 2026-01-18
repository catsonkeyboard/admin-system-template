import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/server': path.resolve(__dirname, './src/server'),
      '@/client': path.resolve(__dirname, './src/client'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/trpc': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
