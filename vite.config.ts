import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3010,
    host: '0.0.0.0',
    allowedHosts: ['dusl7g2h.run.complete.dev']
  },
  preview: {
    port: 3010,
    host: '0.0.0.0',
    allowedHosts: ['dusl7g2h.run.complete.dev']
  }
})
