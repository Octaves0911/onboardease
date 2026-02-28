import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3009,
    host: '0.0.0.0',
    allowedHosts: ['cpowsgeu.run.complete.dev']
  },
  preview: {
    port: 3009,
    host: '0.0.0.0',
    allowedHosts: ['cpowsgeu.run.complete.dev']
  }
})
