import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@/server': path.resolve(__dirname, './src/server'),
      '@/client': path.resolve(__dirname, './src/client'),
      '@/lib': path.resolve(__dirname, './src/client/lib'),
      '@/components': path.resolve(__dirname, './src/client/components'),
      '@': path.resolve(__dirname, './src'),
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
