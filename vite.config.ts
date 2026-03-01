import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3012,
    host: '0.0.0.0',
    allowedHosts: ['j1gzd8e2.run.complete.dev']
  },
  preview: {
    port: 3012,
    host: '0.0.0.0',
    allowedHosts: ['j1gzd8e2.run.complete.dev']
  }
})
