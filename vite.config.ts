import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    host: '0.0.0.0',
    allowedHosts: ['01eaj8do.run.complete.dev']
  },
  preview: {
    port: 3003,
    host: '0.0.0.0',
    allowedHosts: ['01eaj8do.run.complete.dev']
  }
})
