import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3007,
    host: '0.0.0.0',
    allowedHosts: ['juwb6yue.run.complete.dev']
  },
  preview: {
    port: 3007,
    host: '0.0.0.0',
    allowedHosts: ['juwb6yue.run.complete.dev']
  }
})
